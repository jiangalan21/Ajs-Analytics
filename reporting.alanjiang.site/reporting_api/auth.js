const session = require('express-session');
const bcrypt = require('bcrypt');

const sessionMiddleware = session({
    secret: 'AsianXDNinja420!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Set true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
});

function loginRoute(pool) { 

    return async (req, res) => {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
              success: false, 
              message: 'email and password required' 
            });
        }

        try {
            const { rows } = await pool.query(
              'SELECT id, email, password_hash, role FROM users WHERE email = $1', 
              [email]
            );
            if (rows.length === 0) {
                console.log('Login failed: user not found:', email);
                return res.status(401).json({ 
                  success: false, 
                  error: 'Invalid email or password' 
                });
            }

            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            
            if (!passwordMatch) {
                console.log('Login failed: incorrect password for user:', email);
                return res.status(401).json({ 
                  success: false, 
                  error: 'Invalid username or password' 
                });
            }
            req.session.user = {
              id: user.id,
              username: user.display_name,
              role: user.role
            };
            res.json({ 
              success: true, 
              message: 'Login successful',
              data: {
                userId: user.id,
                username: user.display_name,
              }
             });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ 
              success: false, 
              error: 'Internal server error' 
             });
        }
    };
}

function logoutRoute(req, res) {
    req.session.destroy(() => {
        res.json({ success: true });
    });
}
            
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }
        next();
    };
}

module.exports = {
    sessionMiddleware,
    loginRoute,
    logoutRoute,
    requireAuth,
    requireRole
};