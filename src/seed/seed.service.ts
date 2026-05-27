import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './Data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';


@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async runSeed() {
    await this.deleteTables()
    const adminUser = await this.insertUser()
    await this.insertNewProducts(adminUser)
    return 'Seed Execute'
  }

  private async deleteTables() {
    await this.productService.deleteAllProduct()
    //Eliminar usuarios
    const queryBuilder = this.userRepository.createQueryBuilder()
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUser() {

/*     const seedUsers = initialData.users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10)
    })); */
    const seedUsers = initialData.users
    const users: User[] = []

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    });

    const dbUser = await this.userRepository.save(seedUsers)

    return dbUser[0]


  }

  private async insertNewProducts(user: User) {
    this.productService.deleteAllProduct()

    //Insertar de forma Masiva
    const productsInicial = initialData.products
    const insertPromise: Promise<any>[] = []
    productsInicial.forEach(product => {
      //this.productService.create(product)
      insertPromise.push(this.productService.create(product, user))
    })
    await Promise.all(insertPromise)
    return true
  }
}
