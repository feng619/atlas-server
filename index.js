var WebSocketServer = require("ws").Server;
var express = require("express");
var session = require("express-session");
var Passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var BodyParser = require("body-parser");
var cors = require("cors");
var http = require("http");
var crypto = require("crypto");

// factory
require("./factory/card-factory");
require("./factory/game-factory");
// users
var users = require("./users/users").users;

// ------------------------------------------------------------

// 路由
var app = express();
var port = process.env.PORT || 5000;

// ------------------------------------------------------------

// 設定 session / 創造亂碼 128 个字符的随机字符串
crypto.randomBytes(128, (err, buf) => {
  if (err) throw err;
  // console.log(`${buf.length} bytes of random data: ${buf.toString("hex")}`);

  // 设置 session 的可选参数
  app.use(
    session({
      secret: buf.toString("hex"),
      cookie: { maxAge: 60 * 60 * 1000 }, // 1 小時到期
      resave: true,
      saveUninitialized: false
    })
  );
});

// ------------------------------------------------------------

// use
app.use(cors());
app.use(express.static(__dirname + "/"));
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());
app.use(Passport.initialize());
app.use(Passport.session());

// ------------------------------------------------------------

Passport.serializeUser(function(user, done) {
  done(null, user.id);
});

Passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// 设定 Passport 本地策略
var localStrategy = new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password"
  },
  function(username, password, done) {
    user = users[username];

    if (user == null) {
      return done(null, false, { message: "Invalid user" });
    }

    if (user.password !== password) {
      return done(null, false, { message: "Invalid password" });
    }

    done(null, user);
  }
);

Passport.use("local", localStrategy);

// ------------------------------------------------------------

// port
app.post(
  "/login",
  Passport.authenticate("local", { failureFlash: true }),
  function(req, res) {
    console.log("Authentication Successful");
    console.log("User ID " + req.user.id);
    // res.redirect("/");
    return "User ID " + req.user.id;
  }
);

app.get("/", function(req, res) {
  // 检查 session 中的 isVisit 字段
  // 如果存在则增加一次，否则为 session 设置 isVisit 字段，并初始化为 1。
  if (req.session.isVisit) {
    req.session.isVisit++;
    res.send("<p>第 " + req.session.isVisit + "次来此页面</p>");
  } else {
    req.session.isVisit = 1;
    res.send("欢迎第一次来这里");
    console.log(req.session);
  }
});

app.get("/say", function(request, response) {
  response.end("hihiok");
});

// ------------------------------------------------------------

var server = http.createServer(app);
server.listen(port);

console.log("http server listening on %d", port);

// ------------------------------------------------------------

var wss = new WebSocketServer({ server: server });
console.log("websocket server created");

wss.on("connection", function(ws) {
  var id = setInterval(function() {
    ws.send(JSON.stringify(new Date()), function() {});
  }, 1000);

  console.log("websocket connection open");

  ws.on("close", function() {
    console.log("websocket connection close");
    clearInterval(id);
  });
});
