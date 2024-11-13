let selectedItems = [];
let totalWeight = 0;
let totalValue = 0;

// Gestion de la sélection des objets et de l'affichage
$('.item-card').click(function() {
    const itemId = $(this).data('id');
    const itemWeight = $(this).data('weight');
    const itemValue = $(this).data('value');
    const itemIndex = selectedItems.findIndex(item => item.id === itemId);

    // Si l'objet est déjà sélectionné, on le désélectionne
    if (itemIndex !== -1) {
        selectedItems.splice(itemIndex, 1);
        $(this).removeClass('selected');
        totalWeight -= itemWeight;
        totalValue -= itemValue;
    } else {
        // Si l'objet n'est pas sélectionné, on le sélectionne
        if (totalWeight + itemWeight <= parseInt($('#max-weight').val())) {
            selectedItems.push({ id: itemId, weight: itemWeight, value: itemValue });
            $(this).addClass('selected');
            totalWeight += itemWeight;
            totalValue += itemValue;
        } else {
            alert("Le poids maximum est atteint !");
            return;
        }
    }

    // Mise à jour de la barre de progression et de l'affichage du poids restant
    updateProgressBar();
});

// Mise à jour de la barre de progression et de l'affichage du poids restant
function updateProgressBar() {
    const maxWeight = parseInt($('#max-weight').val());
    const remainingWeight = maxWeight - totalWeight;
    const progressPercentage = (totalWeight / maxWeight) * 100;

    $('#progress-bar-inner').css('width', progressPercentage + '%');
    $('#progress-bar-inner').text(`${totalWeight}/${maxWeight}kg`);

    // Désactivation de la sélection des objets si le poids maximum est atteint
    if (totalWeight >= maxWeight) {
        $('.item-card').each(function() {
            const itemWeight = $(this).data('weight');
            if (totalWeight + itemWeight > maxWeight) {
                $(this).prop('disabled', true);
            }
        });
    } else {
        $('.item-card').prop('disabled', false);
    }
}

// Résolution du problème du sac à dos
$('#solve-btn').click(function() {
    const maxWeight = parseInt($('#max-weight').val());

    $.ajax({
        url: '/solve_knapsack',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            max_weight: maxWeight,
            selected_items: selectedItems.map(item => item.id)
        }),
        success: function(response) {
            $('#result').show();
            $('#result-text').text(response.is_valid ? 'La solution est valide.' : 'La solution dépasse le poids maximum.');
            $('#total-weight').text(response.total_weight);
            $('#total-value').text(response.total_value);

            // Affichage des éléments sélectionnés
            $('#selected-items').empty();
            response.selected_items.forEach(item => {
                $('#selected-items').append(`<li>${item.name} - ${item.weight}kg - ${item.value}€</li>`);
            });

            // Affichage des éléments optimaux si existants
            if (response.optimal_items) {
                $('#optimal-solution').show();
                $('#optimal-items').empty();
                response.optimal_items.forEach(item => {
                    $('#optimal-items').append(`<li>${item.name} - ${item.weight}kg - ${item.value}€</li>`);
                });
                $('#optimal-value').text(response.optimal_value);
            }
        }
    });
});

// Validation de la solution
$('#validate-btn').click(function() {
    const maxWeight = parseInt($('#max-weight').val());
    alert(totalWeight <= maxWeight ? 'Solution valide!' : 'Solution invalide!');
});

// Affichage de la solution optimale
$('#optimal-btn').click(function() {
    $('#optimal-solution').toggle();
});
