const auditLog = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const userId = req.user ? req.user.userId : 'unauthenticated'
    console.log(`[AUDIT] ${new Date().toISOString()} ${req.method} ${req.path} user=${userId}`)
  }
  next()
}

module.exports = auditLog
