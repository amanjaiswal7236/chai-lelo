import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const categories = [
    {
      id: 'lunch',
      name: 'Lunch',
      description: 'Delicious lunch meals',
      icon: '🍱',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'dinner',
      name: 'Dinner',
      description: 'Hearty dinner options',
      icon: '🍽️',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      gradient: 'from-purple-400 to-pink-500',
    },
    {
      id: 'dinner-meals',
      name: 'Dinner Meals',
      description: 'Complete dinner meals',
      icon: '🍛',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      gradient: 'from-green-400 to-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Chai Lelo
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Order delicious meals with ease
          </p>
          <p className="text-gray-500">
            Fresh • Fast • Delicious
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/menu/${category.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-72">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 text-3xl transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2 transform group-hover:translate-x-1 transition-transform duration-300">
                    {category.name}
                  </h2>
                  <p className="text-lg opacity-90">{category.description}</p>
                  <div className="mt-4 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Browse Menu →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <span className="text-2xl">✨</span>
            <span className="text-lg font-medium">Fresh ingredients daily</span>
            <span className="text-2xl">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

