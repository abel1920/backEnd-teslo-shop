import { text } from "stream/consumers";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "../../auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
    name: 'products'
})
export class Product {


    @ApiProperty({
        example: 'b6fea583-4111-47cb-800a-24aa8ea2b045',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid') //Definicion de reglas
    id: string;


    @ApiProperty({
        example: 'Jeans-Teslo',
        description: 'Title',
        uniqueItems: true
    })
    @Column('text', { //tipo texto
        unique: true, //No permite duplicados
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Prices',
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'PricesPricesPricesPricesPrices',
        description: 'Description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    descripcion: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Slug',
        default: null
    })
    @Column('text', {
        unique: true
    })
    slug: string

    @ApiProperty({
        example: 10,
        description: 'Stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'L'],
        description: 'Sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'Women',
        description: 'Gender',
    })
    @Column('text')
    gender: string;

    //Tags
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    //Images
    @OneToMany(
        () => ProductImage, //Esto le dice a TypeORM: “la otra entidad en la relación es ProductImage
        (productImage) => productImage.product,
        {
            cascade: true,
            eager: true
        }
    )
    images?: ProductImage[];

    //Muchos a Uno
    @ManyToOne(
        () => User,
        (user) => user.product,
        //Carga toda la informacion de la relacion
        { eager: true })
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title
        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')

    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

}
