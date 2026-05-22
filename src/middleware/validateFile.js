const validateFile = (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const magic = req.file.buffer.slice(0, 4).toString('ascii')
  if (magic !== '%PDF') return res.status(400).json({ error: 'Only PDF files are allowed' })

  next()
}

module.exports = validateFile
