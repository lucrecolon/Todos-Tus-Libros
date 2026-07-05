export const obtenerCoordenadas = async (calle: string, numero: string, codigoPostal: string, provincia: string) => {
    try {
        const buscarEnMapa = async (busqueda: string) => {
            const queryParams = new URLSearchParams({
                q: busqueda,
                format: 'json',
                limit: '1'
            });

            const response = await fetch(`https://nominatim.openstreetmap.org/search?${queryParams.toString()}`);
            if (!response.ok) return null;

            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
            return null;
        };

        const queryExacta = `${calle} ${numero}, ${codigoPostal}, ${provincia}, Argentina`;
        let coordenadas = await buscarEnMapa(queryExacta);

        if (!coordenadas) {
            console.warn(`No se encontró la altura exacta (${numero}), buscando la calle con CP ${codigoPostal}...`);
            const queryCalle = `${calle}, ${codigoPostal}, ${provincia}, Argentina`;
            coordenadas = await buscarEnMapa(queryCalle);
        }

        return coordenadas;

    } catch (error) {
        console.error("Error geocodificando:", error);
        return null;
    }
};