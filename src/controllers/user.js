const User = require("../models/User");
const Post = require("../models/Post");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getUsers = asyncHandler(async (req, res) => {
  let users = await User.find().select("-password").limit(5).lean().exec();

  users.forEach((user) => {
    user.isFollowing = false;
    const followers = user.followers.map((follower) => follower._id.toString());
    if (followers.includes(req.user.id)) {
      user.isFollowing = true;
    }
  });

  users = users.filter((user) => user._id.toString() !== req.user.id);

  res.status(200).json({ success: true, data: users });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })
    .select("-password")
    .populate({ path: "posts", select: "files commentsCount likesCount" })
    .populate({ path: "savedPosts", select: "files commentsCount likesCount" })
    .populate({ path: "followers", select: "avatar username fullname" })
    .populate({ path: "following", select: "avatar username fullname" })
    .lean()
    .exec();

  if (!user) {
    return next({
      message: `O usuário ${req.params.username} não foi encontrado`,
      statusCode: 404,
    });
  }

  user.isFollowing = false;
  const followers = user.followers.map((follower) => follower._id.toString());

  user.followers.forEach((follower) => {
    follower.isFollowing = false;
    if (req.user.following.includes(follower._id.toString())) {
      follower.isFollowing = true;
    }
  });

  user.following.forEach((user) => {
    user.isFollowing = false;
    if (req.user.following.includes(user._id.toString())) {
      user.isFollowing = true;
    }
  });

  if (followers.includes(req.user.id)) {
    user.isFollowing = true;
  }

  user.isMe = req.user.id === user._id.toString();

  res.status(200).json({ success: true, data: user });
});

exports.follow = asyncHandler(async (req, res, next) => {
  // Checa se o usuário existe
  const user = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `No user found for id ${req.params.id}`,
      statusCode: 404,
    });
  }

  // Checa se o usuário não é o mesmo logado
  if (req.params.id === req.user.id) {
    return next({ message: "Você não pode seguir você mesmo", status: 400 });
  }

  // Somente segue se já não estiver seguindo
  if (user.followers.includes(req.user.id)) {
    return next({ message: "Você já está seguindo ele", status: 400 });
  }

  await User.findByIdAndUpdate(req.params.id, {
    $push: { followers: req.user.id },
    $inc: { followersCount: 1 },
  });
  await User.findByIdAndUpdate(req.user.id, {
    $push: { following: req.params.id },
    $inc: { followingCount: 1 },
  });

  res.status(200).json({ success: true, data: {} });
});

exports.unfollow = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next({
      message: `Nenhum usuário encontrado para o id: ${req.params.id}`,
      statusCode: 404,
    });
  }

  // Checa se o usuário não é o mesmo logado
  if (req.params.id === req.user.id) {
    return next({ message: "Você não pode seguir você mesmo", status: 400 });
  }

  await User.findByIdAndUpdate(req.params.id, {
    $pull: { followers: req.user.id },
    $inc: { followersCount: -1 },
  });
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { following: req.params.id },
    $inc: { followingCount: -1 },
  });

  res.status(200).json({ success: true, data: {} });
});

exports.feed = asyncHandler(async (req, res) => {
  const following = req.user.following;

  const users = await User.find()
    .where("_id")
    .in(following.concat([req.user.id]))
    .exec();

  const postIds = users.map((user) => user.posts).flat();

  const posts = await Post.find()
    .populate({
      path: "comments",
      select: "text",
      populate: { path: "user", select: "avatar fullname username" },
    })
    .populate({ path: "user", select: "avatar fullname username" })
    .sort("-createdAt")
    .where("_id")
    .in(postIds)
    .lean()
    .exec();

  posts.forEach((post) => {
    // O usuário logado gostou do post
    post.isLiked = false;
    const likes = post.likes.map((like) => like.toString());
    if (likes.includes(req.user.id)) {
      post.isLiked = true;
    }

    // O usuário logado salvou o post
    post.isSaved = false;
    const savedPosts = req.user.savedPosts.map((post) => post.toString());
    if (savedPosts.includes(post._id)) {
      post.isSaved = true;
    }

    // O post pertence ao usuário logado
    post.isMine = false;
    if (post.user._id.toString() === req.user.id) {
      post.isMine = true;
    }

    // O comentário pertence ao usuário logado
    post.comments.map((comment) => {
      comment.isCommentMine = false;
      if (comment.user._id.toString() === req.user.id) {
        comment.isCommentMine = true;
      }
    });
  });

  res.status(200).json({ success: true, data: posts });
});

exports.searchUser = asyncHandler(async (req, res, next) => {
  if (!req.query.username) {
    return next({ message: "The username cannot be empty", statusCode: 400 });
  }

  const regex = new RegExp(req.query.username, "i");
  const users = await User.find({ username: regex });

  res.status(200).json({ success: true, data: users });
});

exports.editUser = asyncHandler(async (req, res) => {
  const { avatar, username, fullname, website, bio, email } = req.body;

  const fieldsToUpdate = {};
  if (avatar) fieldsToUpdate.avatar = avatar;
  if (username) fieldsToUpdate.username = username;
  if (fullname) fieldsToUpdate.fullname = fullname;
  if (email) fieldsToUpdate.email = email;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: { ...fieldsToUpdate, website, bio },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("avatar username fullname email bio website");

  res.status(200).json({ success: true, data: user });
});
