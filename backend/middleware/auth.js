const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'M0N_T0K3N_3ST_1NTR0UV4BL3');
    const userId = `${decodedToken.userId}`;
    const isAdmin = `${decodedToken.isAdmin}`;
    
    
    
    if (req.body.userId && req.body.userId !== userId) {
      res.status(403).json({error: "403: unauthorized request."});
    } 
    
    else {
      res.locals.isAdmin = isAdmin;
      res.locals.userId = userId;
      next();
    }
  } 
  catch {
    res.status(401).json(
      'Invalid request!')
    ;
  }
};