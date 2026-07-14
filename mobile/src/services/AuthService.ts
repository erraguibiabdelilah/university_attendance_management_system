import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../models/User';

const environment = {
  // RAPPEL: Sur mobile, "localhost" ne fonctionne pas car "localhost" c'est le téléphone lui-même.
  // Utilisez l'IP locale de votre ordinateur. Si vous êtes sur l'émulateur Android, vous pouvez tester '10.0.2.2'.
  apiUrl: 'http://10.181.4.71:8080/api/uca/auth'
};

class AuthService {
  private _item: User = new User();
  private _items: Array<User> = new Array<User>();

  // On utilise directement l'apiUrl car elle pointe déjà vers /auth
  private url = environment.apiUrl;

  async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async login(): Promise<string> {
    console.log("=== TENTATIVE DE CONNEXION ===");
    const loginEndpoint = this.url + '/sign-in/';

    // Envoyer uniquement username et password (pas tout l'objet User avec les booléens)
    const credentials = {
      username: this._item.username,
      password: this._item.password,
    };

    console.log("URL appelée:", loginEndpoint);
    console.log("Données envoyées:", JSON.stringify(credentials));

    try {
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      console.log("Statut de la réponse:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const token = await response.text();
      console.log("Token reçu:", token);
      return token;
    } catch (error) {
      console.error("ERREUR RESEAU OU FETCH:", error);
      throw error;
    }
  }

  async loadUserByUsername(username: string): Promise<User> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(this.url + '/username/' + username, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  }

  get item(): User {
    return this._item;
  }

  set item(value: User) {
    this._item = value;
  }

  get items(): Array<User> {
    return this._items;
  }

  set items(value: Array<User>) {
    this._items = value;
  }
}

export const authService = new AuthService();
