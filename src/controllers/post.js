const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const asyncHandler = require("../middlewares/asyncHandler");
//Pega todos os posts no banco
exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find();

  res.status(200).json({ success: true, data: posts });
});
//Pega um post específico
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: "comments",
      select: "text",
      populate: {
        path: "user",
        select: "username avatar",
      },
    })
    .populate({
      path: "user",
      select: "username avatar",
    })
    .lean()
    .exec();

  if (!post) {
    return next({
      message: `Nenhum post encontrado para o id ${req.params.id}`,
      statusCode: 404,
    });
  }

  //A publicação pertence ao usuário logado?
  post.isMine = req.user.id === post.user._id.toString();

  //O usuário logado gostou da postagem? EM CONSTRUÇÃO
  const likes = post.likes.map((like) => like.toString());
  post.isLiked = likes.includes(req.user.id);

  //O usuário logado salvou a postagem? EM CONSTRUÇÃO
  const savedPosts = req.user.savedPosts.map((post) => post.toString());
  post.isSaved = savedPosts.includes(req.params.id);

  //O comentário da postagem pertence ao usuário conectado? EM CONSTRUÇÃO
  post.comments.forEach((comment) => {
    comment.isCommentMine = false;

    const userStr = comment.user._id.toString();
    if (userStr === req.user.id) {
      comment.isCommentMine = true;
    }
  });

  res.status(200).json({ success: true, data: post });
});
//Deleta um post, se esse post pertencer ao usuário logado
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  //Encontra os posts do id do usuário
  if (!post) {
    return next({
      message: `Nenhum post encontrado para o id ${req.params.id}`,
      statusCode: 404,
    });
  }
  //Checa se o post é do usuario logado
  if (post.user.toString() !== req.user.id) {
    return next({
      message: "Você não está autorizado a deletar esse post",
      statusCode: 401,
    });
  }
  //Encontra o id do usuário no banco e remove -1 ao contador de post nele
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { posts: req.params.id },
    $inc: { postCount: -1 },
  });
  //Remove o post
  await post.remove();

  res.status(200).json({ success: true, data: {} });
});
//Adiciona um post
exports.addPost = asyncHandler(async (req, res, next) => {
  const { caption, files, tags } = req.body;
  const user = req.user.id;
  //Cria o post como o Model pede
  let post = await Post.create({ caption, files, tags, user });
  //Encontra o id do usuário no banco e adiciona +1 ao contador de post nele
  await User.findByIdAndUpdate(req.user.id, {
    $push: { posts: post._id },
    $inc: { postCount: 1 },
  });
  //Faz um replace do caminho específico do documento "user" com o outro documento "post" no banco
  post = await post
    .populate({ path: "user", select: "avatar username fullname" })
    .execPopulate();

  res.status(200).json({ success: true, data: post });
});
//EM CONSTRUÇÃO
exports.toggleLike = asyncHandler(async (req, res, next) => {

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `Nenhum post encontrado para o id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (post.likes.includes(req.user.id)) {
    const index = post.likes.indexOf(req.user.id);
    post.likes.splice(index, 1);
    post.likesCount = post.likesCount - 1;
    await post.save();
  } else {
    post.likes.push(req.user.id);
    post.likesCount = post.likesCount + 1;
    await post.save();
  }

  res.status(200).json({ success: true, data: {} });
});
//EM CONSTRUÇÃO
exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `Nenhum post encontrado para o id ${req.params.id}`,
      statusCode: 404,
    });
  }

  let comment = await Comment.create({
    user: req.user.id,
    post: req.params.id,
    text: req.body.text,
  });

  post.comments.push(comment._id);
  post.commentsCount = post.commentsCount + 1;
  await post.save();

  comment = await comment
    .populate({ path: "user", select: "avatar username fullname" })
    .execPopulate();

  res.status(200).json({ success: true, data: comment });
});
//EM CONSTRUÇÃO
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `Nenhum post encontrado para o id ${req.params.id}`,
      statusCode: 404,
    });
  }

  const comment = await Comment.findOne({
    _id: req.params.commentId,
    post: req.params.id,
  });

  if (!comment) {
    return next({
      message: `Nenhum comentário encontrado para o id ${req.params.id}`,
      statusCode: 404,
    });
  }

  if (comment.user.toString() !== req.user.id) {
    return next({
      message: "Você não está autorizado a deletar este comentário",
      statusCode: 401,
    });
  }

  const index = post.comments.indexOf(comment._id);
  post.comments.splice(index, 1);
  post.commentsCount = post.commentsCount - 1;
  await post.save();

  await comment.remove();

  res.status(200).json({ success: true, data: {} });
});
//EM CONSTRUÇÃO
exports.searchPost = asyncHandler(async (req, res, next) => {
  if (!req.query.caption && !req.query.tag) {
    return next({
      message: "Escreva o título da postagem para procurar",
      statusCode: 400,
    });
  }

  let posts = [];

  if (req.query.caption) {
    const regex = new RegExp(req.query.caption, "i");
    posts = await Post.find({ caption: regex });
  }

  if (req.query.tag) {
    posts = posts.concat([await Post.find({ tags: req.query.tag })]);
  }

  res.status(200).json({ success: true, data: posts });
});
//EM CONSTRUÇÃO
exports.toggleSave = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next({
      message: `Nenhum post encontrado para o id ${req.params.id}`,
      statusCode: 404,
    });
  }

  const { user } = req;

  if (user.savedPosts.includes(req.params.id)) {
    console.log("Removendo post Salvo");
    await User.findByIdAndUpdate(user.id, {
      $pull: { savedPosts: req.params.id },
    });
  } else {
    console.log("Salvando post");
    await User.findByIdAndUpdate(user.id, {
      $push: { savedPosts: req.params.id },
    });
  }

  res.status(200).json({ success: true, data: {} });
});