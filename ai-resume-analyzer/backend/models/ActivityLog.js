const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTERED',
        'USER_LOGIN',
        'USER_LOGOUT',
        'RESUME_UPLOADED',
        'RESUME_ANALYZED',
        'JD_MATCHED',
        'REPORT_DOWNLOADED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET',
        'ADMIN_DELETED_USER',
        'ADMIN_DELETED_RESUME',
      ],
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
