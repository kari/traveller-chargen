from bs4 import BeautifulSoup
import requests

worlds = []

# with open('scripts/canonworlds.html', "r", encoding="utf8") as f:
#     page = BeautifulSoup(f.read(), "html.parser")

r = requests.get('https://wiki.travellerrpg.com/Canon_World_%26_System_Reference_Log#History_.26_Background_.28Dossier.29')
page = BeautifulSoup(r.text, "html.parser")

for heading in page.find("div", {"id": "mw-content-text"}).find_all("h3"):
    print(heading.span.text)
    for node in heading.find_next_siblings():
        if node.name in ["h2","h3"]:
            break
        if node.name == "p":
            # print(node.a.text)
            worlds.append(node.a.text)
        if node.name == "ol":
            for li in node.find_all("li", recursive = False):
                # print(li.a.text)
                worlds.append(li.a.text)

with open("traveller_worlds.txt", "w", encoding="utf8") as f:
    f.write("\n".join(worlds))
