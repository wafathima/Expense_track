"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({
        message: "Internal server error",
    });
};
exports.errorHandler = errorHandler;
