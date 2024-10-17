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

// cityService.js

export const fetchCities = async (searchQuery) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&addressdetails=1&limit=5&accept-language=ru`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Фильтруем результаты, оставляя только города, деревни и посёлки
        return data
            .filter(
                (item) =>
                    item.type === 'city' ||
                    item.type === 'town' ||
                    item.type === 'village'
            )
            .map((item) => ({
                name:
                    item.address.city ||
                    item.address.town ||
                    item.address.village, // Используем только город/поселок/деревню
                fullName: item.display_name, // Для возможного дальнейшего использования
            }));
    } catch (error) {
        console.error('Ошибка при загрузке городов:', error);
        return [];
    }
};
