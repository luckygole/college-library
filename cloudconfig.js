const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
})


// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//       folder: 'college-library_deployment',
//       allowerdFormats : ["PDF" , "pdf"],
//       format: async (req, file) => 'pdf', // supports promises as well
//       public_id: (req, file) => 'computed-filename-using-request',
//     },
//   });




const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
      return {
          folder: 'college-library_deployment',
          resource_type: 'raw',  // Explicitly set resource type to 'raw' for PDFs
          format: 'pdf',         // Specify file format as 'pdf'
          public_id: `pdf_${Date.now()}`,  // Generate a unique public ID
          // type: 'authenticated'  // Set to authenticated for restricted access
          type: 'upload'  // Public access (default)
      };
  },
});


   
module.exports = {
    cloudinary ,
    storage
}  