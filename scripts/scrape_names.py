from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin


def scrape_royal_navy():
    with open("./assets/royal_navy_ships.txt", "w", encoding="utf-8") as f:
        entry_page_url = (
            "https://en.wikipedia.org/wiki/List_of_ship_names_of_the_Royal_Navy"
        )
        r = requests.get(entry_page_url)
        entry_page = BeautifulSoup(r.text, "html.parser")
        for link in (
            entry_page.find("span", {"id": "Alphabetical"})
            .parent.find_next_sibling("ul")
            .find_all("a")
        ):
            href = link.get("href")
            r = requests.get(urljoin("https://www.wikipedia.org/", href))
            ship_page = BeautifulSoup(r.text, "html.parser")
            for heading in ship_page.find("main").find_all("h2"):
                if heading.find_next("span").text in [
                    "See also",
                    "Notes",
                    "References",
                    "Citations",
                ]:
                    continue
                print(heading.find_next("span").text)
                for ship in heading.find_next_sibling("div").find_all("li"):
                    f.write(ship.text + "\n")


def scrape_us_navy():
    with open("./assets/us_navy_ships.txt", "w", encoding="utf-8") as f:
        entry_page_url = (
            "https://en.wikipedia.org/wiki/List_of_United_States_Navy_ships"
        )
        r = requests.get(entry_page_url)
        entry_page = BeautifulSoup(r.text, "html.parser")
        for link in (
            entry_page.find(string="Ships grouped alphabetically")
            .find_next("tr")
            .find_all("a")
        ):
            href = link.get("href")
            r = requests.get(urljoin("https://www.wikipedia.org/", href))
            ship_page = BeautifulSoup(r.text, "html.parser")
            for heading in ship_page.find("main").find_all("h2"):
                if heading.find_next("span").text in [
                    "See also",
                    "Notes",
                    "References",
                    "Citations",
                    "Primary",
                    "Secondary",
                    "External links",
                ]:
                    continue
                print(heading.find_next("span", class_="mw-headline").text)
                for ship in heading.find_next_sibling("div").find_all("li"):
                    f.write(ship.text + "\n")


scrape_us_navy()
