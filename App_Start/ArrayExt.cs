using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TenSecondsMvc
{
    public static class ArrayExt
    {
        /// <summary>  
        /// 从此实例检索子数组  
        /// </summary>  
        /// <param name="source">要检索的数组</param>  
        /// <param name="startIndex">起始索引号</param>  
        /// <param name="length">检索最大长度</param>  
        /// <returns>与此实例中在 startIndex 处开头、长度为 length 的子数组等效的一个数组</returns>  
        public static Array SubArray(this Array source, Int32 startIndex, Int32 length)
        {
            if (startIndex < 0 || startIndex > source.Length || length < 0)
            {
                throw new ArgumentOutOfRangeException();
            }

            Array Destination;
            if (startIndex + length <= source.Length)
            {
                Destination = Array.CreateInstance(source.GetType(), length);
                Array.Copy(source, startIndex, Destination, 0, length);
            }
            else
            {
                Destination = Array.CreateInstance(source.GetType(), source.Length - startIndex);
                Array.Copy(source, startIndex, Destination, 0, source.Length - startIndex);
            }

            return Destination;
        }
    }
}