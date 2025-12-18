import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { UpdateUserDto } from "./update-user.dto/update-user-dto";
import { ConfigService } from "@nestjs/config";
import { JSDOM } from 'jsdom';
import { Prisma } from "@prisma/client";

const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
@Injectable()
export class UsersService {
    

  constructor(
    private readonly prisma: PrismaService,        
    private readonly configService: ConfigService,
  ) {}

    async getSimNanny(id: string, userId: string) {
        try {
            console.log(userId)

            const user = await this.prisma.user.findFirst({
                where: {
                    id: userId
                },
            })

            const nannies = await this.prisma.nannyProfile.findMany({
                where: {
                    user: {
                        residency: user?.residency
                    },
                    NOT: {
                       id: id,
                    }
                },
                include: {
                    user: true,
                    response: true,
                },
                take: 2,                
            })

            if (!nannies) {
                throw new NotFoundException('Nannies not found!');
            }

            return nannies;
        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async changeCity(city: string, userId: string) {
        try {
            const user = await this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    residency: city
                }
            })
 
            if (!user) {
                throw new NotFoundException('User not found!');
            }

            return user;
        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getNannyProfileById(id: string) {
        try {
            const nanny = await this.prisma.user.findFirst({
                where: {
                    nannyProfile: {
                        userId: id
                    },
                },
                include: {
                    nannyProfile: {
                        include: {
                            request: true,
                            response: true,
                            user: true,
                        }
                    }
                }
            })

            return nanny;
        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getNannyById(id: string) {
        try {
            const nanny = await this.prisma.user.findFirst({
                where: {
                    nannyProfile: {
                        id: id
                    },
                },
                include: {
                    nannyProfile: {
                        include: {
                            request: true,
                            response: true,
                            user: true,
                        }
                    }
                }
            })

            return nanny;
        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async validateNanny(id: string) {
        try {
            const nanny = await this.prisma.nannyProfile.update({
                where: {
                    userId: id,
                },
                data: {
                    isValidated: true,
                },
                include: {
                    user: true
                }
            })

            if (nanny === undefined) {
                throw new NotFoundException('Nanny profile not found!');
            }

            return nanny;
        } catch (error) {
            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getNannyByCity(city: string) {
        try {          
            let nanny = await this.prisma.nannyProfile.findMany({
                where: {
                    user: {
                        residency: {
                            contains: city.trim()
                        }
                    }
                },
                include: {
                    response: true,
                    user: true,
                }
            });

            console.log(nanny)
            console.log(city)

            if (nanny.length === 0) {
                throw new NotFoundException('Nanny not found!');
            }

            return nanny;

        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getVacancyByCity(city: string) {
        try {
            const vacancy = await this.prisma.vacancy.findMany({
                where: {
                    parent: {
                        user: {
                            residency: city
                        }
                    }
                },
                include: {
                    childrens: true,
                    parent: {
                        include: {
                            user: true
                        }
                    },
                    responses: true
                }
            })

            if (!vacancy) {
                throw new NotFoundException('Vacancy not found!');
            }

            return vacancy;

        } catch (error) {
            console.log(error)
            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getVacancyById(id: string) {
        try {
            const vacancy = await this.prisma.vacancy.findFirst({
                where: {
                    id: id
                },
                include: {
                    childrens: true,
                    parent: {
                        include: {
                            user: true
                        }
                    },
                    responses: {
                        include: {
                            nanny: {
                                include: {
                                    user: true,
                                    request: true,
                                    response: true
                                }
                            }
                        }
                    }
                }
            })

            if (!vacancy) {
                throw new NotFoundException('Vacancy not found!');
            }

            return vacancy;

        } catch (error) {
            console.log(error)
            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getVacancy(userId: string) {
        try {
            const parent = await this.prisma.user.findFirst({
                where: {
                    id: userId
                },
                include: {
                    parentProfile: true
                }
            })

            if (!parent?.parentProfile?.id) {
                throw new NotFoundException('Parent profile not found!');
            }

            const items = await this.prisma.vacancy.findMany({
                where: {
                    parentId: parent.parentProfile.id,
                },
                include: {
                    parent: {
                        include: {
                            user: true
                        }
                    },
                    childrens: true,
                    responses: {
                        include: {
                            nanny: true,
                            vacancy: true
                        }
                    }
                }
            })

            console.log('items',items)


            if (!items) {
                throw new NotFoundException('Vacancies not found!');
            }

            return items;
        } catch (error) {
            console.log(error)
            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async updateVacancy(userId: string, body: any)
    {
        try {
            const parent = await this.prisma.user.findFirst({
                where: {
                    id: userId
                },
                include: {
                    parentProfile: true
                }
            })

            if (body.contacts !== undefined && body.contacts.email !== undefined && body.contacts.name !== undefined && body.contacts.residency !== undefined) {
                await this.prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        email: body.contacts.email,
                        fullName: body.contacts.name,
                        residency: body.contacts.residency,
                    },
                    include: {
                        parentProfile: true
                    }
                })
            }

            console.log(parent)

            if (parent?.parentProfile?.id === undefined) {
                throw new NotFoundException('Parent profile not found!');
            }

            const existingVacancy = await this.prisma.vacancy.findFirst({
                    where: {
                        parentId: parent?.parentProfile.id
                    },
                    include: {
                        childrens: true
                    }
                });

                if (!existingVacancy) {
                    throw new NotFoundException('Vacancy not found for update');
                }

                console.log(body)

                let updateData: any = body?.data;

                if (body?.data?.childrens) {
                    const { childrens, ...otherData } = body.data;
                        updateData = {
                            ...otherData,
                        }

                        if (childrens !== undefined && childrens !== null) {
                                await this.prisma.children.deleteMany({
                                    where: {
                                        vacId: existingVacancy.id
                                    }
                                });

                            updateData.childrens = {
                                create: childrens
                            };
                        }
                };
                    
                const updatedVacancy = await this.prisma.vacancy.update({
                    where: {
                        id: existingVacancy.id
                    },
                    data: updateData,
                    include: {
                        childrens: true,
                        parent: true,
                        responses: true
                    }
                });

                return updatedVacancy;
        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async createVacancy(userId: string, body: any) {
        try {
            const parent = await this.prisma.user.findFirst({
                where: {
                    id: userId
                },
                include: {
                    parentProfile: true
                }
            })

            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    email: body.contacts.email,
                    fullName: body.contacts.name,
                    residency: body.contacts.residency,
                },
                include: {
                    parentProfile: true
                }
            })

            if (!parent?.parentProfile?.id) {
                throw new NotFoundException('Parent profile not found!');
            }

            const { childrens, ...otherData } = body.data;

            const vacancy = await this.prisma.vacancy.create({
                data: {
                    parent: {
                        connect: {
                            id: parent?.parentProfile?.id,
                        }
                    },
                    childrens: {
                        create: childrens,
                    },
                    ...otherData
                },
                include: {
                    childrens: true,
                    parent: true,
                    responses: true
                }
            })

            
            if (parent === null || parent === undefined) {
                throw new NotFoundException('Parent not found!')
            }

            return vacancy;
        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async createRequest(body: any) {
        try {
            console.log(body)

            const nanny = await this.prisma.nannyProfile.update({
                where: {
                    id: body.id,
                },
                data: {
                    request: {
                        create: {
                            message: body.message,
                            parent: body.parent,
                        }
                    }
                },
                include: {
                    request: true,
                    response: true,
                    user: true
                }
            })

            if (!nanny) {
                throw new NotFoundException('Nanny profile not found!');
            }

            return nanny;
        } catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async subscribeParent(id: string) {
        try {
            const subExpirationMs = parseInt(
                this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
            );

            const data = {
                expiresAt: new Date(Date.now() + subExpirationMs)
            }

            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: {
                    parentProfile: {
                    upsert: {
                        update: {
                        subscribe: {
                            upsert: {
                            update: {
                                expiresAt: data.expiresAt, // продлить на 7 дней
                            },
                            create: {
                                expiresAt: data.expiresAt,
                            },
                            },
                        },
                        },
                        create: {
                        subscribe: {
                            create: {
                            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                            },
                        },
                        },
                    },
                    },
                },
                include: {
                    parentProfile: {
                    include: {
                        subscribe: true,
                    },
                    },
                },
            });

            return updatedUser;
        } catch (error) {
            console.error('Update parent error:', error);

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getUserByUUID(id: string) {
        try {
            const user = await this.prisma.user.findFirst(
                {
                    where: {
                        uuid: id
                    }
                }
                
            )

            if (user === undefined || user === null) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }
            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

async updateNanny(id: string, data: any) {
    try {
        console.log('Received data for update:', JSON.stringify(data, null, 2));

        // Санитизация данных
        const sanitizedData = {
            user: { ...data.user },
            nanny: { ...data.nanny }
        };

        if (sanitizedData.nanny?.jobs) {
            sanitizedData.nanny.jobs = DOMPurify.sanitize(sanitizedData.nanny.jobs);
        }
        if (sanitizedData.nanny?.education) {
            sanitizedData.nanny.education = DOMPurify.sanitize(sanitizedData.nanny.education);
        }
        if (sanitizedData.nanny?.about) {
            sanitizedData.nanny.about = DOMPurify.sanitize(sanitizedData.nanny.about);
        }

        // Валидация и преобразование типов
        const updateData: any = {};

        // Обработка данных пользователя
        if (sanitizedData.user) {
            updateData.phone = sanitizedData.user.phone || undefined;
            updateData.fullName = sanitizedData.user.fullName || undefined;
            updateData.age = sanitizedData.user.age || undefined;
            updateData.residency = sanitizedData.user.residency || undefined;
            updateData.userAvatar = sanitizedData.user.userAvatar || undefined;
            updateData.isVisible = sanitizedData.user.isVisible !== undefined ? sanitizedData.user.isVisible : undefined;
        }

        // Обработка данных няни
        if (sanitizedData.nanny) {
            updateData.nannyProfile = {
                upsert: {
                    update: {
                        about: sanitizedData.nanny.about || undefined,
                        education: sanitizedData.nanny.education || undefined,
                        jobs: sanitizedData.nanny.jobs || undefined,
                        typePay: sanitizedData.nanny.typePay || undefined,
                        pay: sanitizedData.nanny.pay || undefined,
                        experience: sanitizedData.nanny.experience || undefined,
                        agesBaby: sanitizedData.nanny.agesBaby || undefined,
                        duties: sanitizedData.nanny.duties || undefined,
                        advantages: sanitizedData.nanny.advantages || undefined,
                        charts: sanitizedData.nanny.charts || undefined,
                        occupancy: sanitizedData.nanny.occupancy || undefined,
                        audioFile: sanitizedData.nanny.audioFile || undefined,
                        educationFile: sanitizedData.nanny.educationFile || undefined,
                        isValidated: sanitizedData.nanny.isValidated !== undefined ? sanitizedData.nanny.isValidated : undefined,
                        isVisible: sanitizedData.nanny.isVisible !== undefined ? sanitizedData.nanny.isVisible : undefined,
                    },
                    create: {
                        about: sanitizedData.nanny.about || '',
                        education: sanitizedData.nanny.education || '',
                        jobs: sanitizedData.nanny.jobs || '',
                        typePay: sanitizedData.nanny.typePay || 'hourly',
                        pay: sanitizedData.nanny.pay || [],
                        experience: sanitizedData.nanny.experience || '',
                        agesBaby: sanitizedData.nanny.agesBaby || [],
                        duties: sanitizedData.nanny.duties || [],
                        advantages: sanitizedData.nanny.advantages || [],
                        charts: sanitizedData.nanny.charts || [],
                        occupancy: sanitizedData.nanny.occupancy || 'full',
                        audioFile: sanitizedData.nanny.audioFile || '',
                        educationFile: sanitizedData.nanny.educationFile || '',
                        isValidated: sanitizedData.nanny.isValidated !== undefined ? sanitizedData.nanny.isValidated : false,
                        isVisible: sanitizedData.nanny.isVisible !== undefined ? sanitizedData.nanny.isVisible : false,
                    }
                }
            };
        }

        console.log('Processed update data:', JSON.stringify(updateData, null, 2));

        const updatedUser = await this.prisma.user.update({
            where: { id: id },
            data: updateData,
            include: { nannyProfile: true },
        });

        return updatedUser;

    } catch (error) {
        console.error('Update nanny error details:', error);
        
        if (error instanceof Prisma.PrismaClientValidationError) {
            console.error('Validation error details:', error.message);
            throw new BadRequestException('Неверная структура данных для обновления: ' + error.message);
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    const target = error.meta?.target as string[];
                    if (target?.includes('phone')) {
                        throw new ConflictException('Этот номер телефона уже используется');
                    }
                    throw new ConflictException('Конфликт уникальности данных');
                case 'P2025':
                    throw new NotFoundException('Пользователь не найден');
                default:
                    throw new BadRequestException(`Ошибка базы данных: ${error.code}`);
            }
        }

        throw new InternalServerErrorException('Внутренняя ошибка сервера');
    }
}

    async getUserById(id:string) {
        try {
            const user = await this.prisma.user.findFirst(
                {
                    where: {
                        id: id
                    },

                    include: {
                        nannyProfile:true,
                        parentProfile: {
                            include: {
                                subscribe: true
                            }
                        }
                    }
                }
            )

            if (user === undefined || user === null) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }
            console.log(error)
            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async getUserByEmail(email:string) {
        try {
            const user = await this.prisma.user.findFirst(
                {
                    where: {
                        email: email
                    }
                }
            )
            console.log(user)

            if (user === undefined || user === null) {
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            console.error(error);
            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async updateUser(id: string, updateData: UpdateUserDto) {
        try {

            const updatedUser = await this.prisma.user.update(
                {
                    where: {
                        id: id,
                    },
                    data: updateData,
                }
            )

            if (updatedUser === null || updatedUser === undefined) {
                throw new NotFoundException('User not found!')
            }

            return updatedUser;
        } catch (error) {
            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    async respond(nannyId: string, vacId: string, message: string) {
        try {
            const updateVacancy = await this.prisma.vacancy.update(
                {
                    where: {
                        id: vacId,
                    },
                    data: {
                        responses: {
                            create: {
                                nanny: {
                                    connect: { id: nannyId }
                                },
                                message: message 
                            }, 
                        }
                    },
                    include: {
                        childrens: true,
                        parent: true,
                        responses: {
                            include: {
                                nanny: true,
                                vacancy: true,
                            }
                        },
                    }
                },
            )

            if (updateVacancy === null || updateVacancy === undefined) {
                throw new NotFoundException('Vacancy not found!')
            }

            return updateVacancy;
        } 
        
        catch (error) {
            console.log(error)

            if (error.code === '42P01') {
                throw new InternalServerErrorException('Database configuration error');
            }

            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }
}