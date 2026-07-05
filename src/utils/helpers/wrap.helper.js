
export function wrap(handler) {
  return (req, res) => {
    try {
      handler(req, res);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
