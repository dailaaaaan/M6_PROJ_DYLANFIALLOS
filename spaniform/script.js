// Espera a que el documento HTML cargue completamente antes de ejecutar el script
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene las referencias a los elementos del formulario y contenedores
    const ccaaSelect = document.getElementById('ccaa'); // Selector de comunidades autónomas
    const provinciaSelect = document.getElementById('provincia'); // Selector de provincias
    const poblacionSelect = document.getElementById('poblacion'); // Selector de poblaciones
    const imageContainer = document.getElementById('image-container'); // Contenedor para imágenes
    const infoContainer = document.getElementById('info-container'); // Contenedor para información de poblaciones
    const submitButton = document.getElementById('submit'); // Botón de envío
    
    // Carga las comunidades autónomas desde un archivo JSON externo
    fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json')
        .then(response => response.json()) // Convierte la respuesta en JSON
        .then(data => {
            // Itera sobre cada comunidad autónoma y la agrega al selector
            data.forEach(ccaa => {
                const option = document.createElement('option');
                option.value = ccaa.code; // Código de la comunidad
                option.textContent = ccaa.label; // Nombre de la comunidad
                ccaaSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error cargando comunidades autónomas:', error));

    // Agregar animación con Web Animations API a los selects
    [ccaaSelect, provinciaSelect, poblacionSelect].forEach(select => {
        select.addEventListener('mouseover', () => {
            select.animate([
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(1.1)', opacity: 0.8 },
                { transform: 'scale(1)', opacity: 1 }
            ], {
                duration: 500
            });
        });
    });

    // Cargar provincias cuando se seleccione una comunidad autónoma
    ccaaSelect.addEventListener('change', function() {
        const ccaaId = this.value; // Obtiene el código de la comunidad seleccionada
        provinciaSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';

        // Obtiene las provincias desde un JSON externo
        fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json')
            .then(response => response.json())
            .then(data => {
                // Filtra las provincias que pertenecen a la comunidad seleccionada
                data.filter(provincia => provincia.parent_code === ccaaId).forEach(provincia => {
                    const option = document.createElement('option');
                    option.value = provincia.code;
                    option.textContent = provincia.label;
                    provinciaSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error cargando provincias:', error));
    });

    // Cargar poblaciones cuando se seleccione una provincia
    provinciaSelect.addEventListener('change', function() {
        const provinciaId = this.value; // Obtiene el código de la provincia seleccionada
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';

        // Obtiene las poblaciones desde un JSON externo
        fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json')
            .then(response => response.json())
            .then(data => {
                // Filtra las poblaciones que pertenecen a la provincia seleccionada
                data.filter(poblacion => poblacion.parent_code === provinciaId).forEach(poblacion => {
                    const option = document.createElement('option');
                    option.value = poblacion.code;
                    option.textContent = poblacion.label;
                    poblacionSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error cargando poblaciones:', error));
    });

    // Maneja el envío del formulario para mostrar imágenes o información de la población seleccionada
    submitButton.addEventListener('click', function(event) {
        event.preventDefault(); // Evita que la página se recargue al enviar el formulario
        const poblacion = poblacionSelect.options[poblacionSelect.selectedIndex].text; // Obtiene el nombre de la población seleccionada

        if (poblacion) {
            // Limpia los contenedores de imágenes e información antes de mostrar nuevos datos
            imageContainer.innerHTML = '';
            infoContainer.innerHTML = '';

            // Busca imágenes en Wikimedia Commons relacionadas con la población
            fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(poblacion)}&gimlimit=10&prop=imageinfo&iiprop=url`)
                .then(response => response.json())
                .then(data => {
                    // Si hay imágenes disponibles, las muestra en la página
                    if (data.query && data.query.pages) {
                        Object.values(data.query.pages).forEach(page => {
                            if (page.imageinfo && page.imageinfo[0]) {
                                const imageUrl = page.imageinfo[0].url;
                                const imageBox = document.createElement('div');
                                imageBox.className = 'image-box';
                                const img = document.createElement('img');
                                img.src = imageUrl;
                                img.style.width = '100%';
                                img.style.borderRadius = '10px'; // Añade estilos a la imagen
                                imageBox.appendChild(img);
                                imageContainer.appendChild(imageBox);
                            }
                        });
                    } else {
                        // Si no hay imágenes, busca información de la población en GeoNames
                        fetch(`http://localhost:3000/geonames?q=${encodeURIComponent(poblacion)}`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.geonames && data.geonames.length > 0) {
                                    const info = data.geonames[0];
                                    // Muestra la información en el contenedor
                                    infoContainer.innerHTML = `
                                        <p>No hay imágenes disponibles, pero aquí tienes información sobre esta población:</p>
                                        <p><strong>Nombre:</strong> ${info.name}</p>
                                        <p><strong>País:</strong> ${info.countryName}</p>
                                        <p><strong>Población:</strong> ${info.population || 'No disponible'}</p>
                                        <p><strong>Altitud:</strong> ${info.elevation || 'No disponible'} metros</p>
                                    `;
                                } else {
                                    infoContainer.innerHTML = '<p>No se encontró información sobre esta población.</p>';
                                }
                            })
                            .catch(error => console.error('Error obteniendo datos de GeoNames:', error));
                    }
                })
                .catch(error => console.error('Error obteniendo imágenes:', error));
        }
    });
});
