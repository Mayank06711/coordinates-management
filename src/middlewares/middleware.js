import multer from "multer";
import {multerStorageConfig} from "../config/multer.config.js"
import winstonLogger from "../config/winston.config.js";

const upload = multer({ storage:multerStorageConfig }).single('file');



const errorHandler = async (err, req, res, next) => {
    // Default to a 500 Internal Server Error if no status is set
    const statusCode = err.status || 500;
    const message = err.message || 'An unexpected error occurred';

    // Log the error (could be to a file, console, or monitoring service)
    console.error(err);
    winstonLogger.error(`This error occured on ${req.hotsname} \n message:${message} \n code:${statusCode}`)

    // Send the error response
    return res.status(statusCode).json({ message, status: statusCode });
}


const isMonitoring = (req, res, next) => {
    // Check if the request is coming from a monitoring service
    if (req.headers['x-monitoring-service']) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: This request is not from a monitoring service', status: 403 });
    }
}

const isAuthenticated = (req, res, next) => {
    // Check if the request is authenticated
    if (req.headers['authorization']) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized: This request requires authentication', status: 401 });
    }   
}

const isAdmin = (req, res, next) => {
    // Check if the authenticated user is an admin
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Only admins can access this resource', status: 403 });
    }
}

export {
    upload,
    errorHandler,
}