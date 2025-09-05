import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { SuccessCodes } from '@/utils/api-codes';

export class ApiSuccess {
  constructor(
    public code: number,
    public message: string,
    public httpStatusCode: number,
  ) {}
  public sendResponse(res: Response): Response {
    return res.status(this.httpStatusCode).json({
      success: true,
      code: this.code,
      message: this.message,
    });
  }
}

export const successMessages = {
  userLoggedIn: new ApiSuccess(
    SuccessCodes.USER_LOGGED_IN,
    'User login successful',
    StatusCodes.OK,
  ),
  roleCreated: new ApiSuccess(
    SuccessCodes.ROLE_CREATED,
    'User role created successfully',
    StatusCodes.CREATED,
  ),
  userCreated: new ApiSuccess(
    SuccessCodes.USER_CREATED,
    'User created successfully',
    StatusCodes.CREATED,
  ),
  userUpdated: new ApiSuccess(
    SuccessCodes.USER_UPDATED,
    'User updated successfully',
    StatusCodes.CREATED,
  ),
  adminCreated: new ApiSuccess(
    SuccessCodes.ADMIN_CREATED,
    'Admin created successfullly',
    StatusCodes.CREATED,
  ),
  teacherCreated: new ApiSuccess(
    SuccessCodes.TEACHER_CREATED,
    'Teacher created successfullly',
    StatusCodes.CREATED,
  ),
  preferenceAdded: new ApiSuccess(
    SuccessCodes.PREFERENCE_ADDED,
    'Preference added successfullly',
    StatusCodes.CREATED,
  ),
  preferenceUpdated: new ApiSuccess(
    SuccessCodes.PREFERENCE_UPDATED,
    'Preference updated successfully',
    StatusCodes.OK,
  ),
  demoBooked: new ApiSuccess(
    SuccessCodes.DEMO_BOOKED,
    'Demo Booked Successfully',
    StatusCodes.CREATED,
  ),
  slotsCreated: new ApiSuccess(
    SuccessCodes.SLOTS_CREATED,
    'Slots created successfullly',
    StatusCodes.CREATED,
  ),
  sessonsAdded: new ApiSuccess(
    SuccessCodes.SESSIONS_ADDED,
    'Sessions added successfullly',
    StatusCodes.CREATED,
  ),
  logout: new ApiSuccess(
    SuccessCodes.LOGOUT,
    'Logged out successfully',
    StatusCodes.OK,
  ),
  fetchSuccess: new ApiSuccess(
    SuccessCodes.FETCH_DONE,
    'Data fetched successfully',
    StatusCodes.OK,
  ),
  deleteSuccess: new ApiSuccess(
    SuccessCodes.DELETE_DONE,
    'Data deleted Successfully',
    StatusCodes.OK,
  ),
  teacherCapability: new ApiSuccess(
    SuccessCodes.TEACHER_CAPABILITY,
    'Teacher capability added successfully.',
    StatusCodes.CREATED,
  ),
  dataDeleted: new ApiSuccess(
    SuccessCodes.DATA_DELETED,
    'Data Deleted successfully',
    StatusCodes.OK,
  ),
  sessionCancelled: new ApiSuccess(
    SuccessCodes.CANCELLED,
    'Session cancelled successfully',
    StatusCodes.OK,
  ),
  planPurchased: new ApiSuccess(
    SuccessCodes.PLAN_PURCHASED,
    'Plan purchased successfully',
    StatusCodes.OK,
  ),
  subjectAdded: new ApiSuccess(
    SuccessCodes.SUBJECT_ADDED,
    'Subject added successfully',
    StatusCodes.CREATED,
  ),
  setupIntentGenerated: new ApiSuccess(
    SuccessCodes.SETUP_INTENT_CREATED,
    'Setup intent generated',
    StatusCodes.CREATED,
  ),
  subcriptionGroupCreated: new ApiSuccess(
    SuccessCodes.SUBCRIPTION_GROUP_CREATED,
    'subscription group created',
    StatusCodes.CREATED,
  ),
  updateSession: new ApiSuccess(
    SuccessCodes.UPDATE_SESSION,
    'Session updated successfully',
    StatusCodes.OK,
  ),
  otpSent: new ApiSuccess(
    SuccessCodes.OTP_SENT,
    'OTP sent successfully',
    StatusCodes.OK,
  ),
  paymentMethodUpdate: new ApiSuccess(
    SuccessCodes.PAYMENT_METHOD_UPDATE,
    'Payment Method Updated Successfully',
    StatusCodes.OK,
  ),
  tokenRefreshed: new ApiSuccess(
    1503,
    'Token refreshed successfully',
    StatusCodes.OK,
  ),
  refundSuccess: new ApiSuccess(
    SuccessCodes.REFUND_SUCCESS,
    'Refund successfull',
    StatusCodes.OK,
  ),
  slotUpdated: new ApiSuccess(
    SuccessCodes.SLOT_STATUS_UPDATED,
    'SLOT UPDATED',
    StatusCodes.OK,
  ),
  cancelSubscription: new ApiSuccess(
    SuccessCodes.CANCEL_SUBSCRIPTION,
    'Subscription cancelled successfully',
    StatusCodes.OK,
  ),
  preferenceDeleted: new ApiSuccess(
    SuccessCodes.PREFERENCE_DELETED,
    'Preference deleted successfully',
    StatusCodes.OK,
  ),
  pauseSubscription: new ApiSuccess(
    SuccessCodes.PAUSE_SUBSCRIPTION,
    'Subscription paused successfully',
    StatusCodes.OK,
  ),
  subscriptionUpdated: new ApiSuccess(
    SuccessCodes.SUBSCRIPTION_UPDATED,
    'Subscription updated successfully',
    StatusCodes.OK,
  ),
  sessionsDeleted: new ApiSuccess(
    SuccessCodes.SESSIONS_DELETED,
    'Sessions deleted successfully',
    StatusCodes.OK,
  ),
};
