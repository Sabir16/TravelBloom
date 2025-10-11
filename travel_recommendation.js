// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les éléments du DOM
    const description = document.getElementById('description');
    let recommendationsContainer = document.querySelector('#description .recommendations');

    // Créer le conteneur des recommandations s'il n'existe pas
    if (!recommendationsContainer) {
        recommendationsContainer = document.createElement('div');
        recommendationsContainer.className = 'recommendations';
        description.appendChild(recommendationsContainer);
    }

    const searchInput = document.getElementById('SearchInput');
    const btnSearch = document.getElementById('btnSearch');
    const btnClear = document.getElementById('btnClear');
    const btnBook = document.getElementById('btnbook');

    // Fonction pour récupérer et afficher les recommandations
    function fetchRecommendations(keyword = '') {
        fetch('travel_recommendation_api.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Vérifier les données dans la console
                console.log('Données récupérées du JSON :', data);

                // Filtrer les recommandations selon le mot-clé
                let filteredRecommendations = [];
                const keywordLower = keyword.toLowerCase().trim();

                // Vérifier si le mot-clé correspond à un pays
                const matchedCountry = data.countries.find(country => 
                    country.name.toLowerCase().includes(keywordLower) || 
                    country.name.toLowerCase().slice(0, 3).includes(keywordLower)
                );

                if (matchedCountry) {
                    filteredRecommendations = matchedCountry.cities;
                } else if (keywordLower.includes('plage') || keywordLower.includes('beach')) {
                    filteredRecommendations = data.beaches;
                } else if (keywordLower.includes('temple')) {
                    filteredRecommendations = data.temples;
                } else if (keywordLower.includes('pays') || keywordLower.includes('country')) {
                    filteredRecommendations = data.countries.flatMap(country => country.cities);
                } else {
                    // Si aucun mot-clé ou mot-clé non reconnu, afficher toutes les recommandations
                    filteredRecommendations = [
                        ...data.countries.flatMap(country => country.cities),
                        ...data.temples,
                        ...data.beaches
                    ];
                }

                // Limiter à 2 recommandations
                filteredRecommendations = filteredRecommendations.slice(0, 2);

                // Afficher les recommandations
                recommendationsContainer.innerHTML = ''; // Vider uniquement le conteneur des recommandations
                filteredRecommendations.forEach(item => {
                    const recommendationDiv = document.createElement('div');
                    recommendationDiv.className = 'recommendation';
                    const countryName = item.name.split(', ')[0].toLowerCase(); // Extraire le pays pour l'heure
                    recommendationDiv.innerHTML = `
                        <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300';">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <p>Heure locale : ${getCountryTime(countryName)}</p>
                    `;
                    recommendationsContainer.appendChild(recommendationDiv);
                });
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données :', error);
                if (recommendationsContainer) {
                    recommendationsContainer.innerHTML = '<p>Une erreur est survenue. Vérifiez le fichier JSON.</p>';
                } else {
                    description.innerHTML += '<p>Une erreur est survenue. Vérifiez le fichier JSON.</p>';
                }
            });
    }

    // Événement pour le bouton Rechercher
    btnSearch.addEventListener('click', () => {
        const keyword = searchInput.value;
        fetchRecommendations(keyword);
    });

    // Événement pour le bouton Réinitialiser
    btnClear.addEventListener('click', () => {
        searchInput.value = '';
        recommendationsContainer.innerHTML = '';
    });

    // Événement pour le bouton Book Now
    btnBook.addEventListener('click', () => {
        alert('Fonctionnalité de réservation en cours de développement !');
    });

    // Tâche 10 : Afficher l'heure des pays recommandés
    function getCountryTime(countryName) {
        let timeZone = '';
        switch (countryName.toLowerCase()) {
            case 'australia':
                timeZone = 'Australia/Sydney'; break;
            case 'japan':
                timeZone = 'Asia/Tokyo'; break;
            case 'brazil':
            case 'rio de janeiro':
            case 'são paulo':
                timeZone = 'America/Sao_Paulo'; break;
            case 'cambodia':
                timeZone = 'Asia/Phnom_Penh'; break;
            case 'india':
                timeZone = 'Asia/Kolkata'; break;
            case 'french polynesia':
            case 'bora bora':
                timeZone = 'Pacific/Tahiti'; break;
            default:
                timeZone = 'UTC';
        }
        const options = { timeZone, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return new Date().toLocaleTimeString('en-US', options);
    }

    // Charger les recommandations par défaut au démarrage
    fetchRecommendations();
});