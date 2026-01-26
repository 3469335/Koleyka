import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma-db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tableName = searchParams.get('tableName')
    const dbType = (searchParams.get('dbType') || 'production') as 'local' | 'production'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    if (!tableName) {
      return NextResponse.json({ error: 'Имя таблицы не указано' }, { status: 400 })
    }

    const prisma = getPrismaClient(dbType)

    // Находим модель по имени таблицы
    const model = Prisma.dmmf.datamodel.models.find(
      (m) => m.dbName === tableName || m.name.toLowerCase() === tableName.toLowerCase()
    )

    if (!model) {
      return NextResponse.json({ error: 'Таблица не найдена' }, { status: 404 })
    }

    const modelName = model.name
    const modelInstance = (prisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)]

    // Получаем общее количество записей
    const total = await modelInstance.count()

    // Получаем данные с пагинацией
    const skip = (page - 1) * pageSize
    let data = await modelInstance.findMany({
      skip,
      take: pageSize,
      include: getIncludes(model),
    })

    // Трансформируем поля модели
    let fields = model.fields
      .filter((field) => {
        // Исключаем обратные связи (массивы, которые не имеют relationFromFields)
        if (field.relationName && field.isList && !field.relationFromFields?.length) {
          return false
        }
        // Для таблицы users заменяем userType на category
        if (tableName === 'users' && field.name === 'userType') {
          return false // Исключаем userType, добавим category отдельно
        }
        return true
      })
      .map((field) => ({
        name: field.name,
        type: field.type,
        isRequired: field.isRequired,
        isId: field.isId,
        relationName: field.relationName,
      }))

    // Для таблицы users добавляем виртуальное поле category и трансформируем данные
    if (tableName === 'users') {
      // Добавляем поле category в список полей
      fields = fields.map((field) => {
        if (field.name === 'userTypeId') {
          // Заменяем userTypeId на category
          return {
            name: 'category',
            type: 'String',
            isRequired: field.isRequired,
            isId: false,
            relationName: undefined,
          }
        }
        return field
      })

      // Трансформируем данные: заменяем userType на category
      data = data.map((record: any) => {
        const transformed: any = { ...record }
        if (transformed.userType) {
          transformed.category = transformed.userType.category
        } else {
          transformed.category = ''
        }
        // Удаляем объект userType, оставляем только category
        delete transformed.userType
        return transformed
      })
    }

    return NextResponse.json({
      tableName,
      fields,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Ошибка при получении данных таблицы:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении данных таблицы' },
      { status: 500 }
    )
  }
}

// Получаем includes для связанных моделей
function getIncludes(model: any) {
  const includes: any = {}
  for (const field of model.fields) {
    if (field.relationName) {
      includes[field.name] = true
    }
  }
  return Object.keys(includes).length > 0 ? includes : undefined
}
