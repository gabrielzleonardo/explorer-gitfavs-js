import { githubApi } from "./ManageApi.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load = () => {
    this.users = JSON.parse(localStorage.getItem("@github-favorites")) || [];
    if (this.users.length === 0) {
      this.root.querySelector(".empty").classList.remove("hidden");
    }
  };

  save = () => {
    localStorage.setItem("@github-favorites", JSON.stringify(this.users));
  };

  async add(username) {
    try {
      const userExists = this.users.find((user) => user.login === username);

      if (userExists) {
        throw new Error("Usuário já adicionado");
      }

      const user = await githubApi.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado");
      }
      this.users = [...this.users, user];

      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete = (user) => {
    const filteredUsers = this.users.filter(
      (entry) => entry.login !== user.login
    );
    this.users = filteredUsers;

    this.update();
    this.save();
  };
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onAdd();
  }

  onAdd = () => {
    const inputSearch = this.root.querySelector(".search input");
    const addButton = this.root.querySelector(".add");

    document.onkeydown = (event) => {
      if (event.key === "Enter") {
        this.add(inputSearch.value);
        inputSearch.value = "";
      }
    };

    addButton.onclick = () => {
      this.add(inputSearch.value);
      inputSearch.value = "";
    };
  };

  update = () => {
    console.log(this.users);
    this.removeAllTr();
    if(this.users.length === 0) {
      this.showEmptyMessage()
    } else {
      this.root.querySelector(".empty").classList.add("hidden");
    }

    for (const user of this.users) {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;

      row.querySelector(".user img").alt = `Imagem de ${user.name}`;

      row.querySelector(".user a").href = `https://github.com/${user.login}`;

      row.querySelector(".user p").textContent = user.name;

      row.querySelector(".user span").textContent = `/${user.login}`;

      row.querySelector(".repositories").textContent = user.public_repos;

      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Deseja realmente remover este usuário?");

        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    }
  };

  createRow = () => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
    <td class="user">
            <img src="https://github.com/gleonardoalano.png" alt="imagem de gleonardoalano">
            <a href="https://github.com/gleonardoalano" target="_blank">
              <p>Gabriel Leonardo</p>
              <span>/gleonardoalano</span>
            </a>
          </td>
          <td class="repositories">
            21
          </td>
          <td class="followers">
            1
          </td>
          <td><button class="remove">Remover</button></td>
          `;

    return tr;
  };

  removeAllTr = () => {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  };
  showEmptyMessage = () => {
    this.root.querySelector(".empty").classList.remove("hidden");
  };
}
