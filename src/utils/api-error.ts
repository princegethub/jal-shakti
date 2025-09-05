import { StatusCodes } from 'http-status-codes';
import {
  AuthErrorCodes,
  CommonErrorCodes,
  DatabaseErrorCodes,
  ValidationErrorCodes,
} from './api-codes';

class ApiError extends Error {
  public code: number;
  public status: number;
  public cause?: Error;
  constructor(code: number, message: string, status: number, cause?: Error) {
    super(message);
    this.code = code;
    this.status = status;
    this.cause = cause;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * A collection of common API errors used throughout the application.
 * Each error is represented by an instance of `ApiError` with a unique error code, message, and HTTP status code.
 *
 * Errors codes (1000 - 1100)
 *
 * @property {ApiError} somethingWentWrong - General error for unspecified issues.
 * @property {ApiError} userNotFound - Error indicating that the user was not found.
 * @property {ApiError} sessionNotFound - Error indicating that the session was not found.
 * @property {ApiError} invalidUserId - Error indicating that the provided user ID is invalid.
 * @property {ApiError} noDataFound - Error indicating that no data was found.
 * @property {ApiError} missingMandatoryField - Error indicating that a mandatory field is missing.
 * @property {ApiError} unauthorizedAccess - Error indicating that the user or client is not authorized.
 * @property {ApiError} positiveIntegerRequired - Error indicating that a valid positive integer value is required.
 * @property {ApiError} invalidTutorId - Error indicating that the provided tutor ID is invalid.
 * @property {ApiError} invalidPageNumber - Error indicating that the provided page number is invalid.
 * @property {ApiError} invalidLimit - Error indicating that the provided limit is invalid.
 * @property {ApiError} invalidSubjectId - Error indicating that the provided subject ID is invalid.
 * @property {ApiError} invalidGradeId - Error indicating that the provided grade ID is invalid.
 * @property {ApiError} invalidAuthToken - Error indicating that the authentication token is invalid.
 * @property {ApiError} userAccessDenied - Error indicating that the user does not have access to perform the action.
 * @property {ApiError} tokenExpired - Error indicating that the session has expired and the user needs to log in again.
 */

export const validationErrors = {
  validationFailed: (cause?: Error) =>
    new ApiError(
      ValidationErrorCodes.VALIDATION_FAILED,
      'Validation failed',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
};

export const commonErrors = {
  somethingWentWrong: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      StatusCodes.INTERNAL_SERVER_ERROR,
      cause,
    ),
  userNotFound: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.USER_NOT_FOUND,
      'User not found',
      StatusCodes.NOT_FOUND,
      cause,
    ),
  sessionNotFound: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.SESSION_NOT_FOUND,
      'Session not found',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidUserId: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_USER_ID,
      'Please enter a valid user ID',
      StatusCodes.NOT_ACCEPTABLE,
      cause,
    ),
  noDataFound: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.NO_DATA_FOUND,
      'No data found',
      StatusCodes.NOT_FOUND,
      cause,
    ),
  missingMandatoryField: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.MISSING_MANDATORY_FIELD,
      'Missing mandatory field',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  unauthorizedAccess: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.UNAUTHORIZED_ACCESS,
      'User/client not authorized',
      StatusCodes.UNAUTHORIZED,
      cause,
    ),
  positiveIntegerRequired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.POSITIVE_INTEGER_REQUIRED,
      'Please provide a valid positive integer value',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidTutorId: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_TUTOR_ID,
      'Please enter a valid tutor ID',
      StatusCodes.NOT_ACCEPTABLE,
      cause,
    ),
  invalidPageNumber: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_PAGE_NUMBER,
      'Please enter a valid page number',
      StatusCodes.NOT_ACCEPTABLE,
      cause,
    ),
  invalidLimit: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_LIMIT,
      'Please enter a valid limit',
      StatusCodes.NOT_ACCEPTABLE,
      cause,
    ),
  invalidSubjectId: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_SUBJECT_ID,
      'Please enter a valid subject ID',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidGradeId: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_GRADE_ID,
      'Please enter a valid grade ID',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidAuthToken: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_AUTH_TOKEN,
      'Invalid authentication token',
      StatusCodes.UNAUTHORIZED,
      cause,
    ),
  tokenExpired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.TOKEN_EXPIRED,
      'Session expired, please login again',
      StatusCodes.UNAUTHORIZED,
      cause,
    ),
  slotUnavailable: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.UNAVAILABLE_SLOTS,
      'Slots unavailable',
      StatusCodes.NOT_FOUND,
      cause,
    ),
  slotsRequired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.REQUIRED_SLOTS,
      'Slot is required',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  subsciptionRequired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.SUBSCRIPTION_PAUSED_OR_CANCELLED,
      'Subscription is paused or cancelled',
      StatusCodes.CONFLICT,
      cause,
    ),
  subjectIdRequired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.REQUIRED_SUBJECT,
      'Subject Id is required',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  planIdRequired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.REQUIRED_PLANID,
      'Plan Id is required',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  noPendigSlotAvailable: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.UNAVAILABLE_SLOTS,
      'Pending slots unavailable',
      StatusCodes.NOT_IMPLEMENTED,
      cause,
    ),
  studentIdRequired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.studentIdRequired,
      'Student ID is required.',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  enumNameRequired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.ENUM_NAME,
      'Enum name is required',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidSessionState: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_SESSION,
      'Invalid session state',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  alreadyExists: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.ALREADY_EXISTS,
      'data already exists',
      StatusCodes.CONFLICT,
      cause,
    ),
  teacherIdRequired: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.studentIdRequired,
      'Teacher ID is required.',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  missingStartDate: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.MISSING_STARTDATE,
      'Start Date is required.',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidAction: (cause?: Error) =>
    new ApiError(
      CommonErrorCodes.INVALID_ACTION,
      'Invalid action',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
};

/**
 * A collection of authentication-related errors.
 *
 *
 * Error codes (1300 - 1400)
 *
 * @property {ApiError} invalidCredentials - Error for invalid email or password.
 * @property {ApiError} userInactive - Error for inactive user account.
 * @property {ApiError} emailNotRegistered - Error for email not registered.
 * @property {ApiError} duplicateUser - Error for user already exists.
 * @property {ApiError} invalidEmail - Error for invalid email address.
 */
export const authErrors = {
  invalidCredentials: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.INVALID_CREDENTIALS,
      'Invalid email or password',
      StatusCodes.UNAUTHORIZED,
      cause,
    ),
  userInactive: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.INACTIVE_USER,
      'User account is inactive',
      StatusCodes.FORBIDDEN,
      cause,
    ),
  emailNotRegistered: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.EMAIL_NOT_REGISTERED,
      'Email not registered',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  duplicateUser: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.DUPLICATE_USER,
      'User already exists',
      StatusCodes.CONFLICT,
      cause,
    ),
  duplicateEmail: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.DUPLICATE_USER,
      'User email already exists',
      StatusCodes.CONFLICT,
      cause,
    ),
  duplicatePhone: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.DUPLICATE_USER,
      'User phone already exists',
      StatusCodes.CONFLICT,
      cause,
    ),
  invalidEmail: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.INVALID_EMAIL,
      'Invalid email address',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  missingEmail: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.MISSING_EMAIL,
      'Email is mandatory. Please provide an email address',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  missingName: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.MISSING_NAME,
      'Name is missing. Please provide a name',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidPhoneNumber: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.INVALID_PHONE_NUMBER,
      'Invalid phone number',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  missingPhoneNumber: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.MISSING_PHONE_NUMBER,
      'Phone number is missing. Please provide a phone number',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  missingRole: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.MISSING_ROLE,
      'Role is missing. Please provide a role',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidRole: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.INVALID_ROLE,
      'Invalid role',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  missingPassword: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.MISSING_PASSWORD,
      'Password is missing. Please provide a password',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  shortPassword: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.SHORT_PASSWORD,
      'Password nust be at least 4 characters long',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  longPassword: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.LONG_PASSWORD,
      'Password must be at most 16 characters long',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  incorrectPassword: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.INCORRECT_PASSWORD,
      'Incorrect password',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidPassword: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.INVALID_PASSWORD,
      'The password provided is invalid',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  accessDenied: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.ACCESS_DENIED,
      'Access denied. Insufficient permissions.',
      StatusCodes.FORBIDDEN,
      cause,
    ),
  alreadyHaveDemo: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.DEMO_EXISTS,
      'Demo already exists.',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  failedMeetingCreation: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.FAILED_MEETING_CREATION,
      'Failed to create meeting link',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  dateMissing: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.MISSING_DATE,
      'Date parameter is required',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidDate: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.INVALID_DATE,
      'Wrong format of date',
      StatusCodes.BAD_REQUEST,
      cause,
    ),
  invalidLoginCredentials: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.ACCESS_DENIED,
      'invalid credentials',
      StatusCodes.UNAUTHORIZED,
      cause,
    ),
  forbidden: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.ACCESS_DENIED,
      'forbidden access',
      StatusCodes.FORBIDDEN,
      cause,
    ),
  invalidOtp: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.ACCESS_DENIED,
      'invalid otp',
      StatusCodes.UNAUTHORIZED,
      cause,
    ),
  expireOtp: (cause?: Error) =>
    new ApiError(
      AuthErrorCodes.ACCESS_DENIED,
      'OTP Expired',
      StatusCodes.UNAUTHORIZED,
      cause,
    ),
};

/**
 * A collection of success messages used throughout the application.
 * Each message is represented as an instance of `ApiError` with a specific code, message, and HTTP status code.
 *
 * Error codes (1400 - 1500)
 *
 * @property {ApiError} userCreated - Represents a successful user creation event.
 * - Code: 1401
 * - Message: 'User login successful'
 * - HTTP Status: 201 (Created)
 */

/**
 * A collection of predefined `ApiError` instances for common middleware errors.
 *
 * Error codes (1500 - 1600)
 *
 * @property {ApiError} invalidToken - Represents an error for an invalid token with code 1501 and status BAD_REQUEST.
 * @property {ApiError} missingToken - Represents an error for a missing token with code 1502 and status BAD_REQUEST.
 */
export const middlewareErrors = {
  invalidToken: (cause?: Error) =>
    new ApiError(1501, 'Invalid token', StatusCodes.UNAUTHORIZED, cause),
  missingToken: (cause?: Error) =>
    new ApiError(1502, 'Missing token', StatusCodes.UNAUTHORIZED, cause),
  invalidSignature: (cause?: Error) =>
    new ApiError(
      1503,
      'The token signature is invalid',
      StatusCodes.UNAUTHORIZED,
      cause,
    ),
};

/**
 * A collection of predefined `ApiError` instances representing common database errors.
 *
 * @property {ApiError} uniqueConstraint - Error indicating a database unique constraint violation.
 * @property {ApiError} recordNotFound - Error indicating that the requested record was not found.
 * @property {ApiError} queryError - Error indicating a database query error.
 * @property {ApiError} connectionError - Error indicating a database connection error.
 */
export const databaseErrors = {
  uniqueConstraint: (cause?: Error) =>
    new ApiError(
      DatabaseErrorCodes.UNIQUE_CONSTRAINTS,
      'Database unique constraint violation',
      StatusCodes.CONFLICT,
      cause,
    ),
  recordNotFound: (cause?: Error) =>
    new ApiError(
      DatabaseErrorCodes.RECORD_NOT_FOUND,
      'Requested record not found',
      StatusCodes.NOT_FOUND,
      cause,
    ),
  queryError: (cause?: Error) =>
    new ApiError(
      DatabaseErrorCodes.QUERY_ERROR,
      'Database query error',
      StatusCodes.INTERNAL_SERVER_ERROR,
      cause,
    ),
  connectionError: (cause?: Error) =>
    new ApiError(
      DatabaseErrorCodes.CONNECTION_ERROR,
      'Database connection error',
      StatusCodes.SERVICE_UNAVAILABLE,
      cause,
    ),
  noSlotCreated: (cause?: Error) =>
    new ApiError(
      DatabaseErrorCodes.NO_SLOTS_CREATED,
      'No slots created',
      StatusCodes.NOT_ACCEPTABLE,
      cause,
    ),
  slotNotFound: (cause?: Error) =>
    new ApiError(
      DatabaseErrorCodes.SLOT_NOT_FOUND,
      'Slot not found',
      StatusCodes.NOT_FOUND,
      cause,
    ),
  databaseUrlNotFound: (cause?: Error) =>
    new ApiError(
      DatabaseErrorCodes.DATABASE_URL_NOT_FOUND,
      'Database URL not found',
      StatusCodes.NOT_FOUND,
      cause,
    ),
};

export default ApiError;
