import * as L from 'leaflet';
import { Chessground } from 'chessground';
import { Chess } from 'chess.js';

const createChessBoard = (controlsContainer: HTMLDivElement, pgn: string) => {
    const chessBoardContainer = document.createElement('div');
    chessBoardContainer.classList.add('chessboard');

    const chessGround = Chessground(chessBoardContainer, {
        viewOnly: true,
    });

    const chess = new Chess();
    chess.loadPgn(pgn);

    chessGround.set({ fen: chess.fen() });

    const moves = chess.history({ verbose: true });
    const positions = [moves[0].before];
    for (const move of moves) {
        positions.push(move.after);
    }

    // set the orientation based on if the last move was made by black or white
    chessGround.set({ orientation: moves.length % 2 === 0 ? 'black' : 'white' });

    let currentIndex = positions.length - 1;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons');

    const prevButton = document.createElement('button');
    prevButton.innerText = '<';
    prevButton.onclick = () => {
        currentIndex = Math.max(0, currentIndex - 1);
        chessGround.set({ fen: positions[currentIndex] });
    };

    const nextButton = document.createElement('button');
    nextButton.innerText = '>';
    nextButton.onclick = () => {
        currentIndex = Math.min(positions.length - 1, currentIndex + 1);
        chessGround.set({ fen: positions[currentIndex] });
    };

    const analysisButton = document.createElement('a');
    analysisButton.innerText = '🔎';
    analysisButton.href = `https://lichess.org/analysis/pgn/${pgn}`;

    buttonsContainer.append(prevButton, nextButton, analysisButton);

    controlsContainer.append(chessBoardContainer, buttonsContainer);
};

// https://leafletjs.com/

type OpeningData = {
    [key: string]: {
        latitude: number;
        longitude: number;
        openings: { name: string; pgn: string }[];
    };
};
const getOpeningData = async (): Promise<OpeningData> => {
    const res = await fetch('./data/openings.json');
    return await res.json();
};

const onMarkerClick = (
    markerLocationName: string,
    markerLocationData: OpeningData[string],
    sideBarTitle: HTMLHeadingElement,
    coordinateContainer: HTMLHeadingElement,
    openingsContainer: HTMLDivElement
) => {
    sideBarTitle.innerText = markerLocationName;
    const lat = markerLocationData.latitude.toFixed(3);
    const lng = markerLocationData.longitude.toFixed(3);
    coordinateContainer.innerText = `${lat}, ${lng}`;

    while (openingsContainer.firstChild) {
        openingsContainer.firstChild.remove();
    }

    for (const opening of markerLocationData.openings) {
        const openingContainer = document.createElement('details');
        const openingTitle = document.createElement('summary');
        openingTitle.innerText = opening.name;

        const openingContent = document.createElement('div');
        openingContent.classList.add('opening-content');

        createChessBoard(openingContent, opening.pgn);

        openingContainer.append(openingTitle, openingContent);
        openingsContainer.append(openingContainer);
    }
};

const main = async () => {
    const map = L.map('map').setView([0, 0], 1);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 9,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const sideBarTitle = document.getElementById('location') as HTMLHeadingElement;
    const coordinateContainer = document.getElementById('coords') as HTMLHeadingElement;
    const openingsContainer = document.getElementById('openings') as HTMLDivElement;

    const openingData = await getOpeningData();
    for (const locationName in openingData) {
        const locationData = openingData[locationName];
        L.marker([locationData.latitude, locationData.longitude])
            .addTo(map)
            .on('click', () => {
                onMarkerClick(
                    locationName,
                    locationData,
                    sideBarTitle,
                    coordinateContainer,
                    openingsContainer
                );
            });
    }
};

main();
