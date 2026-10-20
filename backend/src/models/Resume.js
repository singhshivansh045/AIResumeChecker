const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 128 
    },
    currentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeVersion',
      default: null,
    },
    latestVersionNumber: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);