const jwt=require('jsonwebtoken');
//middleware authorization
const verifyToken=async(req,res,next)=>{
    let token=req.headers.authorization;
    if(!token || !token.startsWith('Bearer ')){
        return res.status(401).send({message:'no token, authorization dinied'});
    }
    // Bỏ phần "Bearer "
    token=token.split(' ')[1];
    try{
        const jwtSecret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, jwtSecret);
        req.UserID = decoded.id;
        next();
    }catch(error){
        return res.status(401).json({ message: error.message || 'Invalid token' });
    }
};
module.exports={
    verifyToken
}

