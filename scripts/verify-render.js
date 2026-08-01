const { spawn } = require("child_process");
const http = require("http");

const port = 3456;
const server = spawn(
  "node",
  ["node_modules/next/dist/bin/next", "dev", "-p", String(port)],
  { stdio: "pipe" }
);

let output = "";
server.stdout.on("data", (d) => {
  output += d.toString();
});
server.stderr.on("data", (d) => {
  output += d.toString();
});

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://localhost:${port}${path}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      })
      .on("error", reject);
  });
}

async function check() {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (output.includes("Ready in") || output.includes(`http://localhost:${port}`)) {
      break;
    }
  }

  const home = await fetchPage("/");
  console.log("home has style theme data:", home.body.includes('data-theme') || home.body.includes('next-themes'));
  console.log("home has LocaleProvider:", home.body.includes('LocaleProvider'));
  console.log("home has ThemeToggle:", home.body.includes('Toggle theme'));
  console.log("home has LocaleToggle:", home.body.includes('Switch to Arabic'));
  console.log("home has Noto Sans Arabic:", home.body.includes('Noto') && home.body.includes('Arabic'));
  console.log("home html snippet:", home.body.slice(0, 800));

  const pages = ["/", "/dashboard", "/login", "/register"];
  for (const path of pages) {
    try {
      const { status, body } = await fetchPage(path);
      const titleMatch = body.match(/<title>([^]*?)<\/title>/);
      console.log(`${path}: status=${status}, title=${titleMatch ? titleMatch[1] : "none"}, length=${body.length}`);
      if (status >= 500) {
        console.log("SERVER OUTPUT:\n" + output.slice(-2000));
      }
    } catch (e) {
      console.log(`${path}: error=${e.message}`);
    }
  }

  server.kill("SIGTERM");
  process.exit(0);
}

check();
