const multer = require('multer');

const MYME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'files')
    },
    filename: (req, file, callback) => {
        let dateMili = Date.now();
 
        callback(null, dateMili+"-"+Math.round(Math.random() * 10000)+"-"+file.originalname);
    }
});

module.exports = multer({storage}).single('image');