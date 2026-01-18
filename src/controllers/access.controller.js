'use strict';

class AccessController {
    signUp = async (req, res, next) => {
        try {
            console.log('[PGR]:: access :: signUp ::', req.body);
            return res.status(200).json({
                code: 'success',
                metadata: {
                    userId: 1
                }
            })
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AccessController();