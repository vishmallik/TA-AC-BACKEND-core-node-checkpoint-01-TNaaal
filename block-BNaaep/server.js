const http = require("http");
const fs = require("fs");
const qs = require("querystring");
const url = require("url");

const server = http.createServer(handleRequest);

function handleRequest(req, res) {
  let store = "";
  let parsedUrl = url.parse(req.url, true);

  req.on("data", (chunk) => {
    store += chunk;
  });
  req.on("end", () => {
    if (req.method === "GET" && req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./index.html").pipe(res);
    } else if (req.method === "GET" && req.url === "/about") {
      fs.createReadStream("./about.html").pipe(res);
    } else if (req.url.split(".").pop() === "css") {
      res.setHeader("Content-Type", "text/css");
      fs.readFile("." + req.url, (err, content) => {
        if (err) console.log(err);
        res.end(content);
      });
    } else if (req.url.split(".").pop() === "jpg") {
      res.setHeader("Content-Type", "image/jpeg");
      fs.readFile("." + req.url, (err, content) => {
        if (err) console.log(err);
        res.end(content);
      });
    } else if (req.method === "GET" && req.url === "/contact") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./contact.html").pipe(res);
    } else if (req.method === "POST" && req.url === "/form") {
      console.log(store, qs.parse(store));
      let data = JSON.stringify(qs.parse(store));

      let username = qs.parse(store).username;
      fs.open(
        __dirname + "/contacts/" + username + ".json",
        "wx",
        (err, fd) => {
          if (err) {
            console.log(err);
            return res.end(`${username} already exists`);
          }
          fs.writeFile(fd, data, (err) => {
            if (err) {
              return console.log(err);
            }
            fs.close(fd, (err) => {
              if (err) {
                console.log(err);
              }
              res.setHeader("Content-Type", "text/html");
              res.end("<h2>Contact Saved</h2>");
            });
          });
        }
      );
    } else if (req.method === "GET" && req.url === "/users") {
      fs.readdir(__dirname + "/contacts/", (err, files) => {
        if (err) console.log(err);
        let html = "";

        for (let file of files) {
          // fs.readFile(__dirname + "/contacts/" + file, (err, content) => {
          //   if (err) console.log(err);
          //   html +=
          //     `<h1>${JSON.parse(content).name}</h1>` +
          //     `<h2>${JSON.parse(content).email}</h2>` +
          //     `<h2>${JSON.parse(content).username}</h2>` +
          //     `<h2>${JSON.parse(content).age}</h2>` +
          //     `<h2>${JSON.parse(content).about}</h2>`;
          //   console.log(html);
          // });
          fs.createReadStream(__dirname + "/contacts/" + file).pipe(res);
        }
      });
    } else if (req.method === "GET" && parsedUrl.pathname === "/users") {
      let username = parsedUrl.query.username;
      res.setHeader("Content-Type", "text.html");
      fs.readFile(`./contacts/${username}.json`, (err, content) => {
        if (err) console.log(err);

        res.write(`<h1>${JSON.parse(content).name}</h1>`);
        res.write(`<h2>${JSON.parse(content).email}</h2>`);
        res.write(`<h2>${JSON.parse(content).username}</h2>`);
        res.write(`<h2>${JSON.parse(content).age}</h2>`);
        res.write(`<h2>${JSON.parse(content).about}</h2>`);
        res.end();
      });
    } else {
      req.statusCode = 404;
      res.end("Page not found");
    }
  });
}
server.listen(5000, () => {
  console.log("server listening on port 5000");
});
