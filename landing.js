$(document).ready(function () {
    const gameBg = '#6cbaa2';
    const defaultColor = '#333333';

    $(document).scroll(function () {
        const body = $('body');
        const sectionTitle = $('.section-title');
        const sectionSpan = $('.section-title span');
        const main = $('main');

        let alpha = 1 - Math.min(0.1 + 1 * $(this).scrollTop() / body.height(), 0.8);

        if ($(this).scrollTop() < $(window).height() / 10) {
            alpha = 0.9;
        }

        let channel = Math.round(alpha * 255);

        if (alpha < 0.5) {
            sectionTitle.css('color', gameBg);
            sectionTitle.css('border-color', gameBg);
            sectionSpan.css('border-color', gameBg);
            main.css('color', gameBg);
        }
        else if (alpha >= 0.5) {
            sectionTitle.css('color', defaultColor);
            sectionTitle.css('border-color', defaultColor);
            sectionSpan.css('border-color', defaultColor);
            main.css('color', defaultColor);
        }

        body.css('background-color', 'rgb(' + channel + ',' + channel + ',' + channel + ')');
    });
});
