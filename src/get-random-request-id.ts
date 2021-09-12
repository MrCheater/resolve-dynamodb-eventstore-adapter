const getRandomRequestId = () => `${Math.floor(Math.random() * 1000000)}`.padStart(6, '0')

export default getRandomRequestId
