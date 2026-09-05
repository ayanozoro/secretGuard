git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/ayanozoro/secretGuard.git
git push -u origin mainrequire('dotenv').config();

module.exports = {
  apiKey: process.env.API_KEY || 'default-key',
};
