const mongoose = require('mongoose');
module.exports = {
    UserId: mongoose.Types.ObjectId,
    Content: String,
    Abstract: String,
    CreatedTime: Date,
    UpdatedTime: Date,
    UpdatedUserId: mongoose.Types.ObjectId
}