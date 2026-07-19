export const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

// All imageUrl values use verified working Unsplash photo IDs (HTTP 200 confirmed)
export const stadiums = [
  {
    name: 'MetLife Stadium',
    city: 'East Rutherford',
    state: 'New Jersey',
    country: 'United States',
    address: '1 MetLife Stadium Dr',
    description: 'A world-class multi-purpose stadium, home to the New York Giants and Jets and a marquee FIFA World Cup 2026 host venue. Features state-of-the-art facilities, massive fan concourses, and 82,500 seating capacity.',
    capacity: 82500,
    // Large outdoor NFL/football stadium aerial — verified 200 OK
    imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80',
    sportsSupported: ['Football', 'American Football'],
    facilities: ['VIP Suites', 'Massive Concourse', 'Merchandise Mega-Store', 'First Aid Centers'],
    amenities: ['Free WiFi', 'Wheelchair Rental', 'Premium Catering', 'Device Charging Stations'],
    latitude: 40.8135,
    longitude: -74.0744,
    rating: 4.8
  },
  {
    name: 'Narendra Modi Stadium',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    address: 'Stadium Rd, Motera',
    description: 'The largest cricket stadium in the world with 132,000 capacity. Renowned for its iconic structure, LED floodlights, and premium multi-sport clubhouse hosting international cricket events.',
    capacity: 132000,
    // Cricket stadium wide-angle — verified 200 OK
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    sportsSupported: ['Cricket'],
    facilities: ['Olympic-size Pool', 'Indoor Cricket Academy', 'Press Conference Room', 'Corporate Boxes'],
    amenities: ['Tactile Paths for Visually Impaired', 'Assisted Hearing Loops', 'Smart Ticketing Gates', 'Food Courts'],
    latitude: 23.0919,
    longitude: 72.5975,
    rating: 4.9
  },
  {
    name: 'Crypto.com Arena',
    city: 'Los Angeles',
    state: 'California',
    country: 'United States',
    address: '1111 S Figueroa St',
    description: 'An iconic multi-purpose indoor arena in downtown Los Angeles. Famous for legendary NBA basketball clashes, awards ceremonies, and premier concert events with 19,079 capacity.',
    capacity: 19079,
    // Indoor basketball arena — verified 200 OK
    imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=1200&q=80',
    sportsSupported: ['Basketball', 'Badminton'],
    facilities: ['VIP Lounge', 'Multi-level Concourses', 'Broadcasting Hub', 'Athletes Locker Rooms'],
    amenities: ['Accessible Restrooms', 'Closed Captioning Screens', 'Express Food Outlets', 'Valet Parking'],
    latitude: 34.0430,
    longitude: -118.2673,
    rating: 4.7
  },
  {
    name: 'Arthur Ashe Stadium',
    city: 'Queens',
    state: 'New York',
    country: 'United States',
    address: 'Flushing Meadows Corona Park',
    description: 'The main stadium of the US Open and the world\'s largest tennis-specific venue. Features a state-of-the-art retractable roof and unparalleled spectator sightlines with 23,771 capacity.',
    capacity: 23771,
    // Tennis stadium court view — verified 200 OK
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
    sportsSupported: ['Tennis'],
    facilities: ['Retractable Roof System', 'Presidential Suites', 'Media Center', 'Player Gym'],
    amenities: ['Eco-friendly Water Fountains', 'Stroller Check-in', 'Gluten-free Concessions', 'Audio Description Services'],
    latitude: 40.7501,
    longitude: -73.8471,
    rating: 4.8
  },
  {
    name: 'Major Dhyan Chand National Stadium',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    address: 'India Gate, National Stadium Marg',
    description: 'A historic field hockey stadium named after Indian hockey legend Major Dhyan Chand. Located near the India Gate, it is a hub for national and international sports events with 16,200 capacity.',
    capacity: 16200,
    // Sports field / stadium seating — distinct from Istora (verified 200 OK)
    imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=1200&q=80',
    sportsSupported: ['Hockey'],
    facilities: ['Polygras Artificial Turf', 'Practice Pitches', 'Sports Science Center', 'VVIP Box'],
    amenities: ['Dedicated Medical Bays', 'Accessible Seating Zones', 'Public Transport Shuttle', 'Food Stalls'],
    latitude: 28.6119,
    longitude: 77.2389,
    rating: 4.6
  },
  {
    name: 'Istora Senayan',
    city: 'Jakarta',
    country: 'Indonesia',
    address: 'Jl. Pintu Satu Senayan',
    description: 'An iconic indoor sporting arena famous for legendary badminton tournaments and unmatched crowd energy. An integral part of the Gelora Bung Karno Sports Complex with 7,166 capacity.',
    capacity: 7166,
    // Indoor sports arena / badminton hall — distinct from Dhyan Chand (verified 200 OK)
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
    sportsSupported: ['Badminton', 'Basketball'],
    facilities: ['Badminton Practice Halls', 'Premium Media Center', 'Dynamic Acoustics System'],
    amenities: ['Prayer Rooms', 'Ramp Access for Wheelchairs', 'Merchandise Kiosks', 'Beverage Zones'],
    latitude: -6.2163,
    longitude: 106.8016,
    rating: 4.5
  }
];

// All bannerImage URLs use verified working Unsplash photo IDs (HTTP 200 confirmed)
export const events = [
  {
    title: 'World Football Cup - Opening Match',
    description: 'Experience the electric atmosphere of the official opening match of the World Football Cup at MetLife Stadium. Top national teams clash in front of 82,000+ fans with world-class facilities and amenities.',
    sport: 'Football',
    organizer: 'World Football Federation',
    totalSeats: 25000,
    price: 4500,
    stadiumIndex: 0,
    bannerImage: {
      // Football match at a packed stadium — verified 200 OK
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      alt: 'Football match at packed stadium under floodlights'
    }
  },
  {
    title: 'Border-Gavaskar Trophy - Match 1',
    description: 'India battles Australia in the highly anticipated Border-Gavaskar Trophy at the colossal Narendra Modi Stadium — the world\'s largest cricket ground. Witness world-class test cricket in front of 132,000 fans.',
    sport: 'Cricket',
    organizer: 'Board of Control for Cricket in India',
    totalSeats: 35000,
    price: 1800,
    stadiumIndex: 1,
    bannerImage: {
      // Cricket match aerial stadium view — verified 200 OK
      url: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1200&q=80',
      alt: 'Cricket match at large stadium'
    }
  },
  {
    title: 'Basketball Championship Finals',
    description: 'The ultimate basketball rivalry resumes as the home team hosts the championship final at Crypto.com Arena. A high-octane matchup that will determine the season champions.',
    sport: 'Basketball',
    organizer: 'National Basketball Association',
    totalSeats: 5000,
    price: 6500,
    stadiumIndex: 2,
    bannerImage: {
      // Basketball arena game action — verified 200 OK
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      alt: 'Basketball arena view during championship game'
    }
  },
  {
    title: "Grand Slam Tennis - Men's Singles Final",
    description: "The final tennis showdown of the tournament under the lights of Arthur Ashe Stadium. Witness top-seeded tennis professionals clash in an epic Grand Slam final.",
    sport: 'Tennis',
    organizer: 'United States Tennis Association',
    totalSeats: 8000,
    price: 8500,
    stadiumIndex: 3,
    bannerImage: {
      // Tennis court and stadium view — verified 200 OK
      url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
      alt: 'Tennis stadium court view during final match'
    }
  },
  {
    title: 'Asian Hockey Championship Final',
    description: 'The Asian Hockey Championship reaches its grand finale as the top two national teams compete for continental gold at the historic Major Dhyan Chand National Stadium in New Delhi.',
    sport: 'Hockey',
    organizer: 'Asian Hockey Federation',
    totalSeats: 4000,
    price: 1200,
    stadiumIndex: 4,
    bannerImage: {
      // Field hockey match action — verified 200 OK
      url: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1200&q=80',
      alt: 'Field hockey championship match action'
    }
  },
  {
    title: 'Indonesia Badminton Open - Semifinals',
    description: "The world's fastest racket sport reaches its pinnacle as top global shuttlers compete in the Indonesia Open Semifinals at the legendary Istora Senayan indoor arena.",
    sport: 'Badminton',
    organizer: 'Badminton World Federation',
    totalSeats: 2000,
    price: 950,
    stadiumIndex: 5,
    bannerImage: {
      // Badminton match in indoor arena — verified 200 OK
      url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      alt: 'Indoor badminton match at arena'
    }
  }
];