import { faker } from '@faker-js/faker';
import Customer from '../model/customer.Model.js'; // Adjust the path according to your project structure

export const createFakeCustomer = async () => {
  const fakeCustomerData = {
    email: faker.internet.email(),
    gender: faker.person.sex(),
    fullName:`${faker.person.firstName()} ${faker.person.lastName()}`, //
    address: {
      streetAddress: faker.location.streetAddress(),
      state: faker.location.state(),
      city: faker.location.city(),
      landmark: faker.location.secondaryAddress(),
      pinCode: Number(faker.location.zipCode().replace(/\D/g, '')), 
      country: faker.location.country(),
      coordinates: {
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
        altitude: parseFloat(faker.location.latitude()),
        provider: faker.company.name(),
        accuracy: faker.number.float({ min: 0, max: 100 }),
        bearing: faker.number.float({ min: 0, max: 360 }),
      },
    },
    username: faker.internet.userName(),
  };

  try {
    const newCustomer = await Customer.create(fakeCustomerData);
    console.log('Fake customer created:', newCustomer);
  } catch (error) {
    console.error('Error creating fake customer:', error);
  }
};

