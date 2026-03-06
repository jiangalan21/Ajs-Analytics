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

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
              success: false, 
              message: 'Username and password required' 
            });
        }

        try {
            const { rows } = await pool.query(
              'SELECT id, username, password FROM users WHERE username = $1', 
              [username]
            );
            if (rows.length === 0) {
                console.log('Login failed: user not found:', username);
                return res.status(401).json({ 
                  success: false, 
                  error: 'Invalid username or password' 
                });
            }

            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (!passwordMatch) {
                console.log('Login failed: incorrect password for user:', username);
                return res.status(401).json({ 
                  success: false, 
                  error: 'Invalid username or password' 
                });
            }
            req.session.user = {
              id: user.id,
              username: user.username,
            };
            res.json({ 
              success: true, 
              message: 'Login successful',
              data: {
                userId: user.id,
                username: user.username,
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
        if (!req.session.user || !roles.includes(req.session.user.role)) { // add a role col to db
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