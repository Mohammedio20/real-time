const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const cloudinary = require("./../cloudinary");

// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach(el => {
//     if (allowedFields.includes(el)) newObj[el] = obj[el];
//   });
//   return newObj;
// };

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.id });

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({
    message: "User data fetched successfully",
    status: "success",
    data: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ _id: { $ne: req.user.id } });

  if (!users) {
    return next(new AppError("No users found", 404));
  }
  res.status(200).json({
    message: "Users fetched successfully",
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.uploadProfilePic = catchAsync(async (req, res, next) => {
  const image = req.body.image;

  if (!image) {
    return next(new AppError("Please provide an image.", 400));
  }

  const uploadedImage = await cloudinary.uploader.upload(image, {
    folder: "real-time",
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { photo: uploadedImage.secure_url },
    { new: true },
  );

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  res.status(200).json({
    message: "Profile photo updated successfully",
    status: "success",
    data: {
      user,
    },
  });
});
