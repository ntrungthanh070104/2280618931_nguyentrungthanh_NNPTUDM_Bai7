let userController = require('../controllers/users');
let jwt = require('jsonwebtoken');
let fs = require('fs');

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
                return res.status(401).send({ message: "Bạn chưa đăng nhập" });
            }
            let token = req.headers.authorization.split(" ")[1];
            
            // ĐỌC PUBLIC KEY VÀ GIẢI MÃ RS256
            const publicKey = fs.readFileSync('public.pem', 'utf8');
            let result = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            
            // SỬA LỖI: Date.now() phải có ngoặc tròn
            if (result.exp * 1000 < Date.now()) {
                return res.status(401).send({ message: "Token đã hết hạn" });
            }
            
            let user = await userController.GetAnUserById(result.id);
            if (!user) {
                return res.status(404).send({ message: "Người dùng không tồn tại" });
            }
            req.user = user;
            next();
        } catch (error) {
            res.status(401).send({ message: "Token không hợp lệ hoặc lỗi xác thực" });
        }
    }
}