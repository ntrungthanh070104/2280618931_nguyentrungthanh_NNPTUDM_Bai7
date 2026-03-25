var express = require("express");
var router = express.Router();
let userController = require('../controllers/users');
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let fs = require('fs');
const { CheckLogin } = require("../utils/authHandler");

router.post('/register', async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        // Mật khẩu sẽ tự được mã hóa nhờ hàm pre('save') trong Schema của bạn
        let newUser = await userController.CreateAnUser(
            username, password, email, "69b0ddec842e41e8160132b8"
        );
        res.send(newUser);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let user = await userController.GetAnUserByUsername(username);
        
        if (!user) {
            return res.status(404).send({ message: "Thông tin đăng nhập sai" });
        }
        if (user.lockTime && user.lockTime > Date.now()) {
            return res.status(403).send({ message: "Bạn đang bị khóa tài khoản" });
        }

        if (bcrypt.compareSync(password, user.password)) {
            user.loginCount = 0; // Sửa lỗi thiếu user.
            await user.save();
            
            // ĐỌC PRIVATE KEY VÀ TẠO TOKEN RS256
            const privateKey = fs.readFileSync('private.pem', 'utf8');
            let token = jwt.sign({ id: user._id }, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h'
            });
            
            res.send({ message: "Đăng nhập thành công", token: token });
        } else {
            user.loginCount++;
            if (user.loginCount >= 3) {
                user.loginCount = 0;
                user.lockTime = Date.now() + 3600 * 1000;
            }
            await user.save();
            res.status(404).send({ message: "Thông tin đăng nhập sai" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// API /me
router.get('/me', CheckLogin, function (req, res, next) {
    res.send(req.user);
});

// API /changepassword
router.post('/changepassword', CheckLogin, async function (req, res, next) {
    try {
        let { oldPassword, newPassword } = req.body;
        let user = req.user; 

        // Validate mật khẩu mới
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).send({ message: "Mật khẩu mới phải từ 6 ký tự trở lên" });
        }

        // Kiểm tra mật khẩu cũ
        if (!bcrypt.compareSync(oldPassword, user.password)) {
            return res.status(400).send({ message: "Mật khẩu cũ không chính xác" });
        }

        // Gán mật khẩu mới (Schema pre-save hook của bạn sẽ tự động mã hóa nó)
        user.password = newPassword;
        await user.save();

        res.send({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;