const { Readable } = require('stream');
const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');

function getAdminId(req) {
  return req.user?._id?.toString() || req.user?.id?.toString();
}

function uploadBufferToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'uniclubs/announcements',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
}

exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return res.json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Announcement image is required' });
    }

    const uploadedImage = await uploadBufferToCloudinary(req.file.buffer);

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        imageUrl: uploadedImage.secure_url,
        createdBy: getAdminId(req),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: req.params.id },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await prisma.announcement.delete({
      where: { id: req.params.id },
    });

    return res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};
