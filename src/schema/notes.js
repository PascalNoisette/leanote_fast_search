const mongoose = require('mongoose');
module.exports = {
    UserId: {type: mongoose.Types.ObjectId, es_indexed: true },
    NotebookId: {type: mongoose.Types.ObjectId, es_indexed: true},
    Title: {type: String, es_indexed: true, es_analyzer: "rebuilt_french" },
    Desc: {type: String, es_indexed: true, es_index: 'not_analyzed'},
    Content: {type: String, es_indexed: true , es_analyzer: "rebuilt_french"},// Virtual
    ImgSrc: {type: String, es_indexed: true, es_index: 'not_analyzed'},
    IsTrash: {type: Boolean, es_indexed: true},
    UrlTitle: {type: String, es_indexed: true, es_index: 'not_analyzed'},
    HasSelfDefined: {type: Boolean, es_indexed: true},
    IsMarkdown: {type: Boolean, es_indexed: true},
    AttachNum: {type: Number, es_indexed: true},
    CreatedTime: {type: Date, es_indexed: true},
    UpdatedTime: {type: Date, es_indexed: true},
    PublicTime: {type: Date, es_indexed: true},
    UpdatedUserId: {type: mongoose.Types.ObjectId, es_indexed: true},
    Usn: {type: Number, es_indexed: true},
    IsDeleted: {type: Boolean, es_indexed: true},
}