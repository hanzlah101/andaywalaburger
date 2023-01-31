import errorHandler from "../utils/errorHandler.js";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies["connect.sid"];
  if (!token) {
    return next(new errorHandler("Kindly login first!", 401));
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      new errorHandler("You are not allowed to perform this action!", 405)
    );
  }
  next();
};
