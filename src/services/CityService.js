// CityService.js
export const getCities = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&accept-language=ru`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Фильтруем только города и населенные пункты
        const cities = data.filter(
            (item) =>
                item.type === 'city' ||
                item.type === 'town' ||
                item.type === 'village'
        );

        return cities;
    } catch (error) {
        console.error('Ошибка при загрузке городов:', error);
        return [];
    }
};
