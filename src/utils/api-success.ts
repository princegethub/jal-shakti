import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessCodes } from '@/utils/api-codes';

export class ApiSuccess {
  constructor(
    public code: number,
    public message: string,
    public httpStatusCode: number,
    public data?: unknown,
  ) {}

  public sendResponse(res: Response): Response {
    return res.status(this.httpStatusCode).json({
      success: true,
      code: this.code,
      message: this.message,
      data: this.data,
    });
  }

  public withData(data: unknown): ApiSuccess {
    return new ApiSuccess(this.code, this.message, this.httpStatusCode, data);
  }
}

export const successMessages = {
  userLoggedIn: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.USER_LOGGED_IN,
      'User login successful',
      StatusCodes.OK,
      data,
    ),

  roleCreated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.ROLE_CREATED,
      'User role created successfully',
      StatusCodes.CREATED,
      data,
    ),

  userCreated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.USER_CREATED,
      'User created successfully',
      StatusCodes.CREATED,
      data,
    ),

  userUpdated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.USER_UPDATED,
      'User updated successfully',
      StatusCodes.CREATED,
      data,
    ),

  adminCreated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.ADMIN_CREATED,
      'Admin created successfullly',
      StatusCodes.CREATED,
      data,
    ),

  teacherCreated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.TEACHER_CREATED,
      'Teacher created successfullly',
      StatusCodes.CREATED,
      data,
    ),

  preferenceAdded: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.PREFERENCE_ADDED,
      'Preference added successfullly',
      StatusCodes.CREATED,
      data,
    ),

  preferenceUpdated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.PREFERENCE_UPDATED,
      'Preference updated successfully',
      StatusCodes.OK,
      data,
    ),

  demoBooked: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.DEMO_BOOKED,
      'Demo Booked Successfully',
      StatusCodes.CREATED,
      data,
    ),

  slotsCreated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.SLOTS_CREATED,
      'Slots created successfullly',
      StatusCodes.CREATED,
      data,
    ),

  sessonsAdded: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.SESSIONS_ADDED,
      'Sessions added successfullly',
      StatusCodes.CREATED,
      data,
    ),

  logout: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.LOGOUT,
      'Logged out successfully',
      StatusCodes.OK,
      data,
    ),

  fetchSuccess: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.FETCH_DONE,
      'Data fetched successfully',
      StatusCodes.OK,
      data,
    ),

  deleteSuccess: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.DELETE_DONE,
      'Data deleted Successfully',
      StatusCodes.OK,
      data,
    ),

  teacherCapability: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.TEACHER_CAPABILITY,
      'Teacher capability added successfully.',
      StatusCodes.CREATED,
      data,
    ),

  dataDeleted: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.DATA_DELETED,
      'Data Deleted successfully',
      StatusCodes.OK,
      data,
    ),

  sessionCancelled: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.CANCELLED,
      'Session cancelled successfully',
      StatusCodes.OK,
      data,
    ),

  planPurchased: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.PLAN_PURCHASED,
      'Plan purchased successfully',
      StatusCodes.OK,
      data,
    ),

  subjectAdded: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.SUBJECT_ADDED,
      'Subject added successfully',
      StatusCodes.CREATED,
      data,
    ),

  setupIntentGenerated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.SETUP_INTENT_CREATED,
      'Setup intent generated',
      StatusCodes.CREATED,
      data,
    ),

  subcriptionGroupCreated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.SUBCRIPTION_GROUP_CREATED,
      'subscription group created',
      StatusCodes.CREATED,
      data,
    ),

  updateSession: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.UPDATE_SESSION,
      'Session updated successfully',
      StatusCodes.OK,
      data,
    ),

  otpSent: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.OTP_SENT,
      'OTP sent successfully',
      StatusCodes.OK,
      data,
    ),

  paymentMethodUpdate: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.PAYMENT_METHOD_UPDATE,
      'Payment Method Updated Successfully',
      StatusCodes.OK,
      data,
    ),

  tokenRefreshed: (data?: unknown) =>
    new ApiSuccess(1503, 'Token refreshed successfully', StatusCodes.OK, data),

  refundSuccess: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.REFUND_SUCCESS,
      'Refund successfull',
      StatusCodes.OK,
      data,
    ),

  slotUpdated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.SLOT_STATUS_UPDATED,
      'SLOT UPDATED',
      StatusCodes.OK,
      data,
    ),

  cancelSubscription: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.CANCEL_SUBSCRIPTION,
      'Subscription cancelled successfully',
      StatusCodes.OK,
      data,
    ),

  preferenceDeleted: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.PREFERENCE_DELETED,
      'Preference deleted successfully',
      StatusCodes.OK,
      data,
    ),

  pauseSubscription: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.PAUSE_SUBSCRIPTION,
      'Subscription paused successfully',
      StatusCodes.OK,
      data,
    ),

  subscriptionUpdated: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.SUBSCRIPTION_UPDATED,
      'Subscription updated successfully',
      StatusCodes.OK,
      data,
    ),

  sessionsDeleted: (data?: unknown) =>
    new ApiSuccess(
      SuccessCodes.SESSIONS_DELETED,
      'Sessions deleted successfully',
      StatusCodes.OK,
      data,
    ),
};
