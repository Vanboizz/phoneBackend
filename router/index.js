const userRouter = require("./user.router");

function Router(app) {
  app.use("/auth", userRouter);
}

module.exports = Router;
