const userRoutes = require('./userRoute');
const albumRoute = require('./albumRoute');
const artistRoutes = require('./artistRoute');
const playlistRoutes = require('./playlistRoute');
const genreRoutes = require('./genreRoute');
const songRoutes = require('./songRoute');
const favouriteRoutes = require('./favouriteRoute');
const activityRoutes = require('./activityRoute');

module.exports = (app) => {
  app.use('/api/auth', userRoutes);
  app.use('/api/auth', albumRoute);
  app.use('/api/auth', artistRoutes);
  app.use('/api/auth', playlistRoutes);
  app.use('/api/auth', genreRoutes);
  app.use('/api/auth', songRoutes);
  app.use('/api/auth', favouriteRoutes);
  app.use('/api/auth', activityRoutes);
};
