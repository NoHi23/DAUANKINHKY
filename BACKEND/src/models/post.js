// models/Post.js

const mongoose = require('mongoose');

// BƯỚC 1: ĐỊNH NGHĨA 'commentSchema' TRƯỚC
const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });


// BƯỚC 2: SAU ĐÓ MỚI ĐỊNH NGHĨA 'postSchema' VÀ SỬ DỤNG 'commentSchema' BÊN TRONG
const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema] // Dòng này bây giờ sẽ hoạt động vì commentSchema đã được định nghĩa ở trên
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);